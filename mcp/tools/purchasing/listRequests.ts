import { TYPES } from "tedious"
import { z } from "zod"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { departmentParam, vendorsParam, addVendorFilter, fiscalYearParam, limitParam, offsetParam, fiscalYearRange, textResult } from "./shared"

export const listRequestsTool = {
  name: "purchasing_list_requests",
  description: "List purchase requests for the user's department, newest first. Optionally filter by fiscal year or status (Pending, Approved, Approved For AP, Purchased, Completed, Closed, Denied). Returns summary fields only -- use purchasing_get_request for full detail.",
  inputSchema: z.object({
    department: departmentParam,
    year: fiscalYearParam,
    status: z.string().optional().describe("Exact request status to filter on"),
    vendors: vendorsParam,
    limit: limitParam,
    offset: offsetParam,
  }),
  handler: (async ({ department, vendors, year, status, limit = 25, offset = 0 }: { department: string, vendors?: string[], year?: number, status?: string, limit?: number, offset?: number }) => {
    try {
      const where = ["department = @department"]
      const params: QueryParam[] = [{ name: "department", type: TYPES.VarChar, value: department }]

      if(year) {
        const { start, end } = fiscalYearRange(year)
        where.push("createdAt >= @start AND createdAt < @end")
        params.push({ name: "start", type: TYPES.DateTime, value: start }, { name: "end", type: TYPES.DateTime, value: end })
      }

      if(status) {
        where.push("status = @status")
        params.push({ name: "status", type: TYPES.VarChar, value: status })
      }

      addVendorFilter(vendors, where, params)

      const clause = where.join(" AND ")
      const summary = (await executeQuery(`SELECT COUNT(*) AS total, SUM(requestAmount) AS totalAmount FROM request WHERE ${ clause }`, params)).rows[0]

      const rows = (await executeQuery(
        `SELECT requestId, department, requestLocation, requestDetails, vendor, requestAmount, status, requiresAP, createdBy, createdAt
         FROM request WHERE ${ clause }
         ORDER BY createdAt DESC
         OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )).rows

      return textResult({ ...paginate(rows, summary.total, offset, limit), totalAmount: summary.totalAmount ?? 0 })
    } catch (error) {
      return textResult(`Error listing requests: ${ describeError(error) }`)
    }
  }) as any,
}
