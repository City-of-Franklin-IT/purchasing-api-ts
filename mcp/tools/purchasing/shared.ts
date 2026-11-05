import { z } from "zod"
import { parseLocalDate } from "../../utils/filters"
import { TYPES } from "tedious"
import type { QueryParam } from "../mssql/connection"

// Required on EVERY purchasing tool. Every query below filters on it, so a
// caller can only ever see rows belonging to this department. It is a plain
// parameter (no Graph/Entra lookup) -- whatever invokes the tool is trusted to
// pass the authenticated user's own department.
export const departmentParam = z.string().trim().min(1).toUpperCase()
  .describe("REQUIRED. The authenticated user's department (e.g. IT, PARKS, FIRE, POLICE). Results are always limited to this department.")

export const fiscalYearParam = z.number().int().optional()
  .describe("Fiscal year, which ends June 30 (2025 = 2024-07-01 through 2025-06-30). Omit for all years.")

export const limitParam = z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25, max 100)")
export const offsetParam = z.number().int().min(0).optional().describe("Rows to skip, for paging")

export const textResult = (value: unknown) => ({
  content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
})

// Same fiscal-year window as purchasing-api-ts's getRequests/getPurchases
// controllers: year N covers Jul 1 of N-1 through Jun 30 of N.
export const fiscalYearRange = (year: number): { start: Date, end: Date } => ({
  start: parseLocalDate(`${ year - 1 }-07-01`),
  end: parseLocalDate(`${ year }-07-01`), // exclusive upper bound
})

export const vendorsParam = z.array(z.string().trim().min(1)).min(1).max(50).optional()
  .describe("Only rows whose vendor exactly matches one of these names (case-insensitive). To group similarly spelled vendors (e.g. Kroger / Krogers), first call purchasing_list_vendors to see the real spellings, then pass every variant you judge to be the same vendor.")

// Appends an `IN (...)` vendor condition (one bound parameter per name) to the
// caller's where/params arrays. Exact match only -- fuzzy grouping is Claude's
// job, via purchasing_list_vendors.
export const addVendorFilter = (vendors: string[] | undefined, where: string[], params: QueryParam[]) => {
  if(!vendors?.length) return

  const names = vendors.map((vendor, i) => {
    params.push({ name: `vendor${ i }`, type: TYPES.VarChar, value: vendor })
    return `@vendor${ i }`
  })

  where.push(`LTRIM(RTRIM(vendor)) IN (${ names.join(", ") })`)
}
