import { TYPES } from "tedious"
import { z } from "zod"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { departmentParam, vendorsParam, addVendorFilter, fiscalYearParam, limitParam, offsetParam, fiscalYearRange, textResult } from "./shared"

export const listPurchasesTool = {
  name: "purchasing_list_purchases",
  description: "List purchases for the user's department, newest first, optionally filtered by fiscal year. A purchase either stems from a request (requestId set, purchaseId null) or is a standalone purchase (purchaseId set). Returns summary fields only -- use purchasing_get_purchase for full detail.",
  inputSchema: z.object({
    department: departmentParam,
    year: fiscalYearParam,
    vendors: vendorsParam,
    limit: limitParam,
    offset: offsetParam,
  }),
  handler: (async ({ department, vendors, year, limit = 25, offset = 0 }: { department: string, vendors?: string[], year?: number, limit?: number, offset?: number }) => {
    try {
      const where = ["department = @department"]
      const params: QueryParam[] = [{ name: "department", type: TYPES.VarChar, value: department }]

      if(year) {
        const { start, end } = fiscalYearRange(year)
        where.push("createdAt >= @start AND createdAt < @end")
        params.push({ name: "start", type: TYPES.DateTime, value: start }, { name: "end", type: TYPES.DateTime, value: end })
      }

      addVendorFilter(vendors, where, params)

      const clause = where.join(" AND ")
      const summary = (await executeQuery(`SELECT COUNT(*) AS total, SUM(purchaseAmount) AS totalAmount FROM purchase WHERE ${ clause }`, params)).rows[0]

      const rows = (await executeQuery(
        `SELECT purchaseId, requestId, department, purchaseLocation, purchaseDetails, vendor, purchaseAmount, status, createdBy, createdAt
         FROM purchase WHERE ${ clause }
         ORDER BY createdAt DESC
         OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )).rows

      return textResult({ ...paginate(rows, summary.total, offset, limit), totalAmount: summary.totalAmount ?? 0 })
    } catch (error) {
      return textResult(`Error listing purchases: ${ describeError(error) }`)
    }
  }) as any,
}
