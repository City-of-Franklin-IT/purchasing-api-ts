import { TYPES } from "tedious"
import { z } from "zod"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { departmentParam, limitParam, offsetParam, textResult } from "./shared"

export const listApprovalsTool = {
  name: "purchasing_list_approvals",
  description: "List approvals on requests in the user's department, newest first. Use for \"what's pending approval\" or \"what has X approved/denied\". approval is a nullable boolean: true = approved, false = denied, null = still pending.",
  inputSchema: z.object({
    department: departmentParam,
    state: z.enum(["pending", "approved", "denied"]).optional().describe("Filter by approval state"),
    approverEmail: z.string().optional().describe("Only approvals assigned to this approver's email"),
    limit: limitParam,
    offset: offsetParam,
  }),
  handler: (async ({ department, state, approverEmail, limit = 25, offset = 0 }: { department: string, state?: "pending" | "approved" | "denied", approverEmail?: string, limit?: number, offset?: number }) => {
    try {
      const where = ["r.department = @department"]
      const params: QueryParam[] = [{ name: "department", type: TYPES.VarChar, value: department }]

      if(state === "pending") where.push("a.approval IS NULL")
      if(state === "approved") where.push("a.approval = 1")
      if(state === "denied") where.push("a.approval = 0")

      if(approverEmail) {
        where.push("a.approverEmail = @approverEmail")
        params.push({ name: "approverEmail", type: TYPES.VarChar, value: approverEmail })
      }

      const from = "FROM approval a INNER JOIN request r ON r.requestId = a.requestId"
      const clause = where.join(" AND ")
      const total = (await executeQuery(`SELECT COUNT(*) AS total ${ from } WHERE ${ clause }`, params)).rows[0].total

      const rows = (await executeQuery(
        `SELECT a.requestId, r.requestDetails, r.vendor, r.requestAmount, r.status AS requestStatus,
                a.approverEmail, a.approval, a.isFinal, a.note, a.updatedAt
         ${ from } WHERE ${ clause }
         ORDER BY a.updatedAt DESC
         OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )).rows

      return textResult(paginate(rows, total, offset, limit))
    } catch (error) {
      return textResult(`Error listing approvals: ${ describeError(error) }`)
    }
  }) as any,
}
