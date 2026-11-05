// Trailing corporate suffixes dropped before comparing vendor names. Anything
// else ("technologies", "group", "supply") is part of the name and kept, so
// "Dell" and "Dell Technologies" stay separate vendors.
const CORPORATE_SUFFIXES = new Set(["inc", "llc", "co", "corp", "company", "ltd"])

// Collapses spelling noise (case, punctuation, spacing, a leading "the",
// trailing corporate suffixes) so variants of one vendor share a key.
// Spaces are removed from the result so "HomeDepot" matches "Home Depot".
export const vendorKey = (name: string): string => {
  const words = name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)

  if(words[0] === "the" && words.length > 1) words.shift()

  while(words.length > 1 && CORPORATE_SUFFIXES.has(words[words.length - 1])) words.pop()

  return words.join("")
}

export interface VendorRow {
  vendor: string
  requests: number
  purchases: number
  totalAmount: number
}

export interface VendorGroup {
  vendor: string
  variants: { vendor: string, requests: number, purchases: number }[]
  requests: number
  purchases: number
  totalAmount: number
}

// Groups per-spelling rows by vendorKey. The canonical name is the most
// frequently used spelling (ties broken alphabetically); variants lists every
// raw spelling so callers can pass them to the `vendors` filter as-is.
export const groupVendors = (rows: VendorRow[]): VendorGroup[] => {
  const groups = new Map<string, VendorGroup>()

  for(const row of rows) {
    const key = vendorKey(row.vendor) || row.vendor.toLowerCase()
    const group = groups.get(key) ?? { vendor: row.vendor, variants: [], requests: 0, purchases: 0, totalAmount: 0 }

    group.variants.push({ vendor: row.vendor, requests: row.requests, purchases: row.purchases })
    group.requests += row.requests
    group.purchases += row.purchases
    group.totalAmount += row.totalAmount
    groups.set(key, group)
  }

  return [...groups.values()].map((group) => {
    group.variants.sort((a, b) => (b.requests + b.purchases) - (a.requests + a.purchases) || a.vendor.localeCompare(b.vendor))
    return { ...group, vendor: group.variants[0].vendor }
  })
}
