import { Express, Request, Response } from "express"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { randomUUID } from "crypto"

export const setupMcpRoutes = (app: Express, transports: Map<string, StreamableHTTPServerTransport>, createMcpServer: () => McpServer) => {
  // --- Health check endpoint ---
  app.get("/purchasing/health", (req: Request, res: Response) => {
    res.json({ status: "ok", mcp: "connected", timestamp: new Date().toISOString() })
  })

  // --- Middleware to fix Accept header for claude.ai compatibility ---
  app.use("/purchasing", (req: Request, _res: Response, next) => {
    const accept = req.headers.accept || ""
    if (!accept.includes("text/event-stream")) {
      req.headers.accept = "application/json, text/event-stream"
    }
    next()
  })

  // --- Single MCP endpoint ---
  app.post("/purchasing", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined

      let transport: StreamableHTTPServerTransport

      if (sessionId && transports.has(sessionId)) {
        transport = transports.get(sessionId)!
      } else {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            transports.set(id, transport)
          },
        })
        transport.onclose = () => {
          if (transport.sessionId) transports.delete(transport.sessionId)
        }
        const server = createMcpServer()
        await server.connect(transport)
      }

      await transport.handleRequest(req, res, req.body)
    } catch (error) {
      console.error("MCP POST error:", error)
      res.status(500).json({ error: String(error) })
    }
  })

  // --- Optional: handle GET for server-initiated SSE streams ---
  app.get("/purchasing", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined
    const transport = sessionId ? transports.get(sessionId) : undefined

    if (!transport) {
      res.status(404).json({ error: "Session not found" })
      return
    }

    await transport.handleRequest(req, res)
  })

  // --- Optional: handle DELETE for explicit session termination ---
  app.delete("/purchasing", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined
    const transport = sessionId ? transports.get(sessionId) : undefined

    if (!transport) {
      res.status(404).json({ error: "Session not found" })
      return
    }

    await transport.handleRequest(req, res)
  })
}
