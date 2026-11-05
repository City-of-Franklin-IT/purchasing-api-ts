import { Express, Request, Response } from "express"
import { randomUUID } from "crypto"
import { entra } from "../middleware/entra"
import { runChatTurn } from "../utils/agentLoop"
import { clearHistory, sessionBelongsTo } from "../utils/chatSessions"

const DEPARTMENTS = ["IT", "PARKS", "FIRE", "POLICE"]

export const setupChatRoutes = (app: Express, tools: any[]) => {
  // --- Chat turn: { sessionId?, message, department } -> { sessionId, reply } ---
  app.post("/purchasing/chat", entra, async (req: Request, res: Response) => {
    const { message, sessionId, department: rawDepartment } = req.body ?? {}

    if(typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "message is required" })
      return
    }

    const department = typeof rawDepartment === "string" ? rawDepartment.trim().toUpperCase() : ""

    if(!DEPARTMENTS.includes(department)) {
      res.status(400).json({ error: "department is required" })
      return
    }

    const user = (req.entra?.preferred_username ?? "").toLowerCase()

    // A session is only continued by the same user and department that started
    // it; anything else gets a fresh session (and a new sessionId in the reply)
    // so history from one department never leaks into another.
    const activeSessionId = typeof sessionId === "string" && sessionId && sessionBelongsTo(sessionId, department, user) ? sessionId : randomUUID()

    try {
      const reply = await runChatTurn(tools, activeSessionId, message.trim(), department, user)
      res.json({ sessionId: activeSessionId, reply })
    } catch(error) {
      console.error("Chat turn error:", error)
      res.status(500).json({ error: "Failed to generate a response" })
    }
  })

  // --- Explicit "start a new conversation" reset ---
  app.delete("/purchasing/chat/:sessionId", entra, (req: Request, res: Response) => {
    clearHistory(String(req.params.sessionId))
    res.status(204).end()
  })
}
