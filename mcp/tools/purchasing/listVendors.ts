import { TYPES } from "tedious"
import { z } from "zod"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { groupVendors, VendorRow } from "../../utils/vendors"
import { departmentParam, limitParam, textResult } from "./shared"

export const listVendorsTool = {
  name: "purchasing_list_vendors",
  description: "List vendors used on requests and purchases in the user's department. By default (group=true) similarly spelled names are merged into one group (e.g. \"Home Depot\", \"The Home Depot\", \"Home depot\"; case, punctuation, spacing, a leading \"the\" and suffixes like Inc/LLC are ignored). Each group has a canonical name, `variants` (every raw spelling with counts), request and purchase counts, and totalAmount, sorted by `sortBy`. Use this for any vendor question, including rankings (\"top vendor\"). Pass a group's `variants` as `vendors` to purchasing_list_requests / purchasing_list_purchases. Grouping only catches formatting differences, not typos (\"Kroger\" vs \"Krogers\") -- merge those yourself. group=false lists each exact spelling separately.",
  inputSchema: z.object({
    department: departmentParam,
    search: z.string().trim().min(1).optional().describe("Return only vendor names containing this text or sounding like it (SOUNDEX), applied to raw names before grouping. Omit to include every vendor."),
    group: z.boolean().optional().describe("Merge similarly spelled vendors into groups (default true). false = one row per exact spelling."),
    sortBy: z.enum(["count", "totalAmount"]).optional().describe("Rank by number of requests+purchases, or by total dollar amount (default totalAmount)"),
    limit: limitParam,
  }),
  handler: (async ({ department, search, group = true, sortBy = "totalAmount", limit = 25 }: { department: string, search?: string, group?: boolean, sortBy?: "count" | "totalAmount", limit?: number }) => {
    try {
      const params: QueryParam[] = [{ name: "department", type: TYPES.VarChar, value: department }]
      let searchClause = ""

      if(search) {
        // Escape LIKE wildcards so the search text is matched literally.
        const escaped = search.replace(/[\\%_\[]/g, (char) => `\\${ char }`)
        searchClause = "AND (vendor LIKE @like ESCAPE '\\' OR SOUNDEX(vendor) = SOUNDEX(@search))"
        params.push({ name: "like", type: TYPES.VarChar, value: `%${ escaped }%` }, { name: "search", type: TYPES.VarChar, value: search })
      }

      const rows = (await executeQuery(
        `SELECT vendor, SUM(requests) AS requests, SUM(purchases) AS purchases, SUM(amount) AS totalAmount
         FROM (
           SELECT LTRIM(RTRIM(vendor)) AS vendor, 1 AS requests, 0 AS purchases, requestAmount AS amount
           FROM request WHERE department = @department AND vendor IS NOT NULL AND LTRIM(RTRIM(vendor)) <> '' ${ searchClause }
           UNION ALL
           SELECT LTRIM(RTRIM(vendor)), 0, 1, purchaseAmount
           FROM purchase WHERE department = @department AND vendor IS NOT NULL AND LTRIM(RTRIM(vendor)) <> '' ${ searchClause }
         ) v
         GROUP BY vendor`,
        params
      )).rows as VendorRow[]

      // Grouping and ranking happen in code over ALL of the department's vendors, so a
      // limit can never cut a spelling off before it is merged into its group.
      const entries = group ? groupVendors(rows) : rows.map((row) => ({ ...row, variants: [{ vendor: row.vendor, requests: row.requests, purchases: row.purchases }] }))
      const score = (entry: { requests: number, purchases: number, totalAmount: number }) => sortBy === "count" ? entry.requests + entry.purchases : entry.totalAmount
      const data = entries.sort((a, b) => score(b) - score(a) || a.vendor.localeCompare(b.vendor)).slice(0, limit)

      return textResult({ data, returned: data.length, totalGroups: entries.length, grouped: group, sortedBy: sortBy, limit })
    } catch (error) {
      return textResult(`Error listing vendors: ${ describeError(error) }`)
    }
  }) as any,
}
