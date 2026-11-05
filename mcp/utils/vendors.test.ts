import test from "node:test"
import assert from "node:assert/strict"
import { vendorKey, groupVendors } from "./vendors"

test("Home Depot variants share a key", () => {
  const keys = ["Home Depot", "The Home Depot", "Home depot", "HomeDepot", "THE HOME DEPOT, INC.", "Home-Depot Inc"].map(vendorKey)
  assert.equal(new Set(keys).size, 1)
})

test("different vendors stay separate", () => {
  assert.notEqual(vendorKey("Home Depot"), vendorKey("Lowe's"))
  assert.notEqual(vendorKey("Dell"), vendorKey("Dell Technologies"))
  assert.notEqual(vendorKey("Kroger"), vendorKey("Krogers")) // typos are left to the model
})

test("a name that is only a suffix or 'the' is not emptied", () => {
  assert.equal(vendorKey("Company"), "company")
  assert.equal(vendorKey("The"), "the")
})

test("groupVendors merges, sums and picks the most used spelling", () => {
  const groups = groupVendors([
    { vendor: "Home depot", requests: 1, purchases: 0, totalAmount: 10 },
    { vendor: "Home Depot", requests: 3, purchases: 2, totalAmount: 100 },
    { vendor: "The Home Depot", requests: 1, purchases: 1, totalAmount: 5 },
    { vendor: "Lowe's", requests: 1, purchases: 0, totalAmount: 7 },
  ])
  assert.equal(groups.length, 2)
  const hd = groups.find((g) => g.vendor === "Home Depot")!
  assert.deepEqual([hd.requests, hd.purchases, hd.totalAmount, hd.variants.length], [5, 3, 115, 3])
})
