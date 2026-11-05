import Anthropic from "@anthropic-ai/sdk"
import { getHistory, saveHistory } from "./chatSessions"
import { toAnthropicTools, callTool, scopeToDepartment } from "./anthropicTools"
import { formatLocalDate } from "./filters"

// Built lazily (not at module load) because TypeScript hoists all
// import/require calls above app.ts's dotenv.config() call -- an eager
// `new Anthropic(...)` here would read process.env before it's populated.
let anthropic: Anthropic | undefined

const getClient = () => {
  if(!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return anthropic
}

// 1024 was too tight: extended thinking tokens count against this same
// budget, so a turn that reasons hard about tool selection can burn the
// whole budget on thinking and leave nothing for the actual reply --
// surfacing as stop_reason "max_tokens" and an empty-looking answer.
const MAX_TOKENS = 4096

// Bounds one chat turn to this many tool_use round-trips before giving up,
// so a confused tool-call loop can't run indefinitely against the DB.
const MAX_TOOL_ITERATIONS = 6

const systemPrompt = (department: string) => `You are an assistant for City of Franklin purchasing staff, answering questions about purchase requests and purchases: departments, vendors, amounts, statuses, approvals, and delegates.

Today's date is ${ formatLocalDate(new Date()) }.

Use the provided tools to look up data -- never guess or invent values. All data is read-only. Keep answers concise and specific (request/purchase IDs, departments, vendors, amounts, statuses) rather than restating the question. If a tool call fails or returns no data, say so plainly instead of speculating.

A request becomes a purchase once it's bought -- purchasing_get_request includes the linked purchase (if one exists yet), its approvals, and its delegate. purchasing_get_purchase includes the linked request (if any) plus its closed/coding/OPIQ/reconciliation/emergency-purchase detail. Use purchasing_list_approvals for "what's pending approval" or "what has X approved/denied" questions -- approval is a nullable boolean (true = approved, false = denied, null = still pending), so don't treat null as denied when summarizing status.

Every tool is already scoped to the user's department (${ department }) -- you cannot query other departments, and you don't need to ask which department they mean. If asked about another department, say you can only see ${ department }.

Vendor is free text, so one vendor often appears under several spellings (e.g. "Home Depot", "The Home Depot", "Home depot"). For ANY vendor question -- including rankings like "top vendor" or "who do we spend the most with" -- call purchasing_list_vendors (grouping is on by default) and work from its grouped results. Never ask the user whether to combine similar vendors; just combine them. Grouping ignores case, punctuation, spacing, a leading "the" and suffixes like Inc/LLC, but not typos: if two remaining groups are clearly the same vendor (e.g. "Kroger" and "Krogers"), merge them yourself, add their numbers, and say so. To list a vendor's requests or purchases, pass the group's \`variants\` names (every spelling, from all merged groups) as \`vendors\` to purchasing_list_requests / purchasing_list_purchases. When you report a vendor, state which metric ranked them (total spend or request/purchase count) and list the spellings merged into it so the user can correct you. Both list tools return \`totalAmount\` for the whole filtered set (not just the current page), so use it for "how much did we spend" questions instead of adding up rows.

The chat UI renders full markdown (via react-markdown + remark-gfm), including GFM tables, bold/italic, and lists. For genuinely tabular results -- multiple requests, purchases, or approvals -- use a markdown table; it's easier to scan than the same rows written out as prose. For a single record, just describe it in a sentence or two instead of a one-row table. The UI is a narrow sidebar panel, not a full page: keep tables to a handful of well-chosen columns (the ones the question actually needs) rather than dumping every field a tool returned.

Build tables (and every other answer) only from the fields the tool you already called returned. Don't make extra tool calls just to add another column for display polish unless the user specifically asked for that field -- every extra tool call is real, noticeable latency for someone waiting on a chat reply.`

// Lightweight enough to leave on permanently -- duration/tokens per call is
// the minimum needed to see where a slow turn's time actually went, without
// dumping the full response.usage object into prod logs on every call. Flags
// stop_reason "max_tokens" explicitly since that means the reply got cut off
// (possibly by thinking tokens alone eating the whole budget -- see MAX_TOKENS).
const logCallTiming = (callIndex: number, startedAt: number, response: Anthropic.Messages.Message) => {
  const flag = response.stop_reason === "max_tokens" ? " -- TRUNCATED, ran out of max_tokens" : ""
  console.log(`[timing] claude call ${ callIndex } -- ${ Date.now() - startedAt }ms, stop_reason=${ response.stop_reason }, output_tokens=${ response.usage.output_tokens }, thinking_tokens=${ response.usage.output_tokens_details?.thinking_tokens ?? 0 }${ flag }`)
}

export const runChatTurn = async (allTools: any[], sessionId: string, userMessage: string, department: string, user: string): Promise<string> => {
  const turnStart = Date.now()
  const client = getClient()
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5"
  const tools = scopeToDepartment(allTools, department)
  const anthropicTools = toAnthropicTools(tools)
  const messages: Anthropic.Messages.MessageParam[] = [
    ...getHistory(sessionId),
    { role: "user", content: userMessage },
  ]

  let callStart = Date.now()
  let response = await client.messages.create({
    model,
    max_tokens: MAX_TOKENS,
    system: systemPrompt(department),
    tools: anthropicTools,
    messages,
  })
  logCallTiming(0, callStart, response)

  let iterations = 0

  while(response.stop_reason === "tool_use" && iterations < MAX_TOOL_ITERATIONS) {
    iterations += 1
    messages.push({ role: "assistant", content: response.content })

    const toolResults: Anthropic.Messages.ContentBlockParam[] = []

    for(const block of response.content) {
      if(block.type === "tool_use") {
        const toolStart = Date.now()
        const text = await callTool(tools, block.name, block.input)
        console.log(`[timing] tool ${ block.name } -- ${ Date.now() - toolStart }ms`)
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: text })
      }
    }

    messages.push({ role: "user", content: toolResults })

    callStart = Date.now()
    response = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: systemPrompt(department),
      tools: anthropicTools,
      messages,
    })
    logCallTiming(iterations, callStart, response)
  }

  console.log(`[timing] TOTAL turn -- ${ Date.now() - turnStart }ms across ${ iterations } tool iteration(s)`)

  messages.push({ role: "assistant", content: response.content })
  saveHistory(sessionId, messages, department, user)

  const reply = response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim()

  return reply || "I wasn't able to generate a response for that -- please try rephrasing."
}
