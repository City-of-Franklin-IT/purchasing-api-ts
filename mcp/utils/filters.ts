// `new Date("YYYY-MM-DD")` parses as UTC midnight, but connection.ts sets
// useUTC:false, so tedious serializes it using LOCAL getters -- on a
// non-UTC server tz (America/Chicago) that silently shifts the date back
// a day (e.g. "2025-07-01" -> Jun 30). Parsing the components directly into
// a local Date sidesteps the UTC/local mismatch entirely. Copied verbatim
// from mcp/vesting's utils/filters.ts (itself copied from mcp/stormwater) --
// same server, same bug class.
export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

// The inverse mistake of the one above: `date.toISOString()` always converts
// to UTC first, which on a non-UTC server tz (America/Chicago) can report
// tomorrow's date for several hours every evening (e.g. 8pm CDT is already
// past midnight UTC). Use this instead of toISOString().slice(0, 10)
// anywhere "today" (or any other Date instance) needs to be read back as the
// server's actual local calendar date.
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${ year }-${ month }-${ day }`
}
