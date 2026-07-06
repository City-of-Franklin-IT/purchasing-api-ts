import { Router } from "express"
import { createReconciliation } from "@controllers/reconciliation"
import { entra } from "@middleware/auth"

const router = Router()

router.use(entra)

router
  .post('/', createReconciliation)

export default router