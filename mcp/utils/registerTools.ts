import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

type Tool = {
  name: string
  description: string
  inputSchema: any
  handler: any
}

export const registerAllTools = (mcpServer: McpServer, tools: Tool[]) => {
  for (const tool of tools) {
    mcpServer.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.inputSchema ?? {} },
      tool.handler
    )
  }
}
