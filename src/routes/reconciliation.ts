import { Router } from "express"
import { createReconciliation } from "@controllers/reconciliation"
import { entra } from "@middleware/auth"
import { requireWrite } from "@utils/requireRole"

const router = Router()

router.use(entra)

router
  .post('/', requireWrite, createReconciliation)

export default router