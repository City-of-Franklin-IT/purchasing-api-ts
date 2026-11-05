import type Anthropic from "@anthropic-ai/sdk"

type MessageParam = Anthropic.Messages.MessageParam

// In-memory only, same as the MCP transports Map in routes/mcp.ts -- lost on
// restart/redeploy, which is fine for a chat panel and not meant to be a
// durable record.
const sessions = new Map<string, MessageParam[]>()

// Who a session belongs to. A sessionId alone is not a credential, so a
// session is only continued by the same user and department that created it.
const owners = new Map<string, { department: string, user: string }>()

// Bounds how much history (and therefore tokens) a single session accumulates.
// Trimmed in whole user+assistant turns so a tool_result is never left
// orphaned from the tool_use that preceded it.
const MAX_MESSAGES_PER_SESSION = 20

export const getHistory = (sessionId: string): MessageParam[] => sessions.get(sessionId) ?? []

export const sessionBelongsTo = (sessionId: string, department: string, user: string): boolean => {
  const owner = owners.get(sessionId)
  return !owner || (owner.department === department && owner.user === user)
}

export const saveHistory = (sessionId: string, messages: MessageParam[], department: string, user: string) => {
  let trimmed = messages

  while(trimmed.length > MAX_MESSAGES_PER_SESSION) {
    trimmed = trimmed.slice(2)
  }

  sessions.set(sessionId, trimmed)
  owners.set(sessionId, { department, user })
}

export const clearHistory = (sessionId: string) => {
  sessions.delete(sessionId)
  owners.delete(sessionId)
}
