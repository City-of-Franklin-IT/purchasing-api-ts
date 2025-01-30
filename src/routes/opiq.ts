import { Router } from "express"
import { createOPIQ, updateOPIQ, deleteOPIQ } from "@controllers/opiq"
import { protect } from "@middleware/auth"

const router = Router()

router.use(protect)

router
  .post('/', createOPIQ)

router
  .route('/:uuid')
  .put(updateOPIQ)
  .delete(deleteOPIQ)

export default router