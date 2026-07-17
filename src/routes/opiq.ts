import { Router } from "express"
import { createOPIQ, updateOPIQ, deleteOPIQ } from "@controllers/opiq"
import { entra } from "@middleware/auth"
import { requireWrite } from "@utils/requireRole"

const router = Router()

router.use(entra)

router
  .post('/', requireWrite, createOPIQ)

router
  .route('/:uuid')
  .put(requireWrite, updateOPIQ)
  .delete(requireWrite, deleteOPIQ)

export default router