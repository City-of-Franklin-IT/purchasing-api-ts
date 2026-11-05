import { z } from "zod"

// Same shape as the `Tool` type in `registerTools.ts` -- kept loose ("any")
// to match how the tool objects in `tools/purchasing/*.ts` are already typed.
type Tool = {
  name: string
  description: string
  inputSchema: any
  handler: any
}

export type AnthropicToolDef = {
  name: string
  description: string
  input_schema: { type: "object" } & Record<string, any>
}

// Reuses each tool's existing zod schema (already written for MCP's
// `registerTool`) as the JSON schema Claude needs for native tool use,
// via zod v4's built-in `z.toJSONSchema()` -- no separate schema to maintain.
export const toAnthropicTools = (tools: Tool[]): AnthropicToolDef[] =>
  tools.map((tool) => {
    const schema = z.toJSONSchema(tool.inputSchema ?? z.object({})) as { type: "object" } & Record<string, any>
    delete schema.$schema

    return {
      name: tool.name,
      description: tool.description,
      input_schema: schema,
    }
  })

// Calls the same handler the MCP transport would call, and flattens its
// `content` blocks to a single string for the tool_result Claude expects.
export const callTool = async (tools: Tool[], name: string, input: unknown): Promise<string> => {
  const tool = tools.find((t) => t.name === name)

  if(!tool) {
    return `Error: unknown tool "${ name }"`
  }

  const result = await tool.handler(input ?? {})

  return (result?.content ?? [])
    .map((block: { type: string; text?: string }) => block.text ?? "")
    .join("\n")
}

// Returns copies of the tools with `department` removed from the input schema
// (so the model can neither see nor set it) and forced to the caller's value
// in the handler. The raw MCP endpoint keeps the original tools, where
// `department` stays a required param.
export const scopeToDepartment = (tools: Tool[], department: string): Tool[] =>
  tools.map((tool) => ({
    ...tool,
    inputSchema: tool.inputSchema.omit({ department: true }),
    handler: (input: Record<string, unknown>) => tool.handler({ ...input, department }),
  }))
