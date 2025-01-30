import { Router } from "express"
import { updateReconciliation } from "@controllers/reconciliation"
import { protect } from "@middleware/auth"

const router = Router()

router.use(protect)

router
  .put('/:uuid', updateReconciliation)

export default router