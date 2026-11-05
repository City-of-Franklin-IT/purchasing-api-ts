import { TYPES } from "tedious"
import { z } from "zod"
import { executeQuery } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { departmentParam, textResult } from "./shared"

export const getRequestTool = {
  name: "purchasing_get_request",
  description: "Get full detail for one purchase request in the user's department by requestId, including its linked purchase (if it has been bought yet), its approvals, and its delegate.",
  inputSchema: z.object({
    department: departmentParam,
    requestId: z.string().describe("The request's ID, as returned by purchasing_list_requests (e.g. REQ2025IT-1736000000)"),
  }),
  handler: (async ({ department, requestId }: { department: string, requestId: string }) => {
    try {
      const request = (await executeQuery(
        "SELECT * FROM request WHERE requestId = @requestId AND department = @department",
        [{ name: "requestId", type: TYPES.VarChar, value: requestId }, { name: "department", type: TYPES.VarChar, value: department }]
      )).rows[0]

      if(!request) {
        return textResult(`No request found with ID ${ requestId } in department ${ department }`)
      }

      const requestIdParam = { name: "requestId", type: TYPES.VarChar, value: requestId }

      // Sequential, not Promise.all -- see the note in connection.ts about one in-flight request per Connection.
      const purchase = (await executeQuery("SELECT * FROM purchase WHERE requestId = @requestId", [requestIdParam])).rows[0] ?? null
      const approvals = (await executeQuery("SELECT * FROM approval WHERE requestId = @requestId ORDER BY createdAt", [requestIdParam])).rows
      const delegate = (await executeQuery("SELECT * FROM delegate WHERE requestId = @requestId", [requestIdParam])).rows[0] ?? null

      return textResult({ ...request, purchase, approvals, delegate })
    } catch (error) {
      return textResult(`Error getting request: ${ describeError(error) }`)
    }
  }) as any,
}
