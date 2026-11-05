import { TYPES } from "tedious"
import { z } from "zod"
import { executeQuery } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { departmentParam, textResult } from "./shared"

export const getPurchaseTool = {
  name: "purchasing_get_purchase",
  description: "Get full detail for one purchase in the user's department, including its linked request (if any) and its closed, coding, OPIQ, reconciliation, and emergency-purchase records. Look it up by purchaseId (standalone purchases) or by requestId (purchases that stem from a request).",
  inputSchema: z.object({
    department: departmentParam,
    id: z.string().describe("A purchaseId (e.g. PUR2025IT-...) or the requestId the purchase stems from"),
  }),
  handler: (async ({ department, id }: { department: string, id: string }) => {
    try {
      const purchase = (await executeQuery(
        "SELECT * FROM purchase WHERE (purchaseId = @id OR requestId = @id) AND department = @department",
        [{ name: "id", type: TYPES.VarChar, value: id }, { name: "department", type: TYPES.VarChar, value: department }]
      )).rows[0]

      if(!purchase) {
        return textResult(`No purchase found with ID ${ id } in department ${ department }`)
      }

      const parent = { name: "uuid", type: TYPES.UniqueIdentifier, value: purchase.uuid }

      // Sequential, not Promise.all -- see the note in connection.ts about one in-flight request per Connection.
      const request = purchase.requestId
        ? (await executeQuery("SELECT * FROM request WHERE requestId = @requestId", [{ name: "requestId", type: TYPES.VarChar, value: purchase.requestId }])).rows[0] ?? null
        : null
      const closed = (await executeQuery("SELECT * FROM closed WHERE parentId = @uuid", [parent])).rows[0] ?? null
      const coding = (await executeQuery("SELECT * FROM coding WHERE parentId = @uuid", [parent])).rows[0] ?? null
      const opiq = (await executeQuery("SELECT * FROM opiq WHERE parentId = @uuid", [parent])).rows[0] ?? null
      const reconciliation = (await executeQuery("SELECT * FROM reconciliation WHERE parentId = @uuid", [parent])).rows[0] ?? null
      const emergency = (await executeQuery("SELECT * FROM emergency WHERE parentId = @uuid", [parent])).rows[0] ?? null

      return textResult({ ...purchase, request, closed, coding, opiq, reconciliation, emergency })
    } catch (error) {
      return textResult(`Error getting purchase: ${ describeError(error) }`)
    }
  }) as any,
}
