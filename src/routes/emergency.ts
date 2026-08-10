import { Router } from "express"
import { createEmergency, updateEmergency, deleteEmergency } from "@controllers/emergency"
import { entra } from "@middleware/auth"
import { requireWrite } from "@utils/requireRole"

const router = Router()

router.use(entra)

router
  .route('/')
  .post(requireWrite, createEmergency)

router
  .route('/:uuid')
  .put(requireWrite, updateEmergency)
  .delete(requireWrite, deleteEmergency)

export default router
