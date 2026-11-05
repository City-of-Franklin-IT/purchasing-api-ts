import dotenv from "dotenv"
import { join } from "path"

// Single, authoritative env load — path is relative to the process cwd (project root)
// rather than __dirname, so it resolves the same way whether run via `tsx app.ts` (dev)
// or `tsx dist/app.js` (prod), as long as the process is started from this project's root.
dotenv.config({ path: join(process.cwd(), ".env"), quiet: true })

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import express from "express"
import cors from "cors"
import tools from "./tools"
import { setupMcpRoutes } from "./routes/mcp"
import { setupChatRoutes } from "./routes/chat"
import { registerAllTools } from "./utils/registerTools"

const app = express()
const PORT = parseInt(process.env.MCP_PORT || "7005", 10)
const LISTEN_HOST = "0.0.0.0"
let EXTERNAL_URL = process.env.MCP_HOST || `http://0.0.0.0:${ PORT }`

EXTERNAL_URL = new URL(EXTERNAL_URL).toString()

// Same whitelist as purchasing-api-ts's own `app.use(cors(...))` — only the browser
// chat panel needs this; the raw MCP endpoint below is used by non-browser
// MCP clients, which aren't subject to CORS.
const ALLOWED_ORIGINS = [
  "https://dev.franklintn.gov",
  "https://apps.franklintn.gov",
  "https://istest.franklintn.gov",
]

app.use(cors({ origin: ALLOWED_ORIGINS }))
app.use(express.json())

// Setup MCP routes
const transports = new Map()

setupMcpRoutes(app, transports, () => {
  const mcpServer = new McpServer({ name: "purchasing-mcp-server", version: "1.0.0" })
  registerAllTools(mcpServer, tools)
  return mcpServer
})

// Entra-gated chat endpoint for the AI chat panel — runs Claude against the
// same tools above directly in-process, no MCP JSON-RPC transport involved.
setupChatRoutes(app, tools)

// Start HTTP server
const server = app.listen(PORT, LISTEN_HOST, () => {
  console.log(`MCP server listening on ${ EXTERNAL_URL }`)
})

server.on('error', (err) => {
  console.error(`Server error on port ${ PORT }:`, err.message)
  process.exit(1)
})
