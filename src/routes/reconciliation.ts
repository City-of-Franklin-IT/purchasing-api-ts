import { Router } from "express"
import { updateReconciliation } from "@controllers/reconciliation"
import { protect, entra } from "@middleware/auth"

const router = Router()

router.use(entra)

router
  .put('/:uuid', updateReconciliation)

export default router