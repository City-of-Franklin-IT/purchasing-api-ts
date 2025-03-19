import { Router } from "express"
import { createOPIQ, updateOPIQ, deleteOPIQ } from "@controllers/opiq"
import { protect, entra } from "@middleware/auth"

const router = Router()

router.use(entra)

router
  .post('/', createOPIQ)

router
  .route('/:uuid')
  .put(updateOPIQ)
  .delete(deleteOPIQ)

export default router