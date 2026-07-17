import { Router } from "express"
import { createCode, updateCode, deleteCode } from "@controllers/coding"
import { entra } from "@middleware/auth"
import { requireWrite } from "@utils/requireRole"

const router = Router()

router.use(entra)

router
  .route('/')
  .post(requireWrite, createCode)

router
  .route('/:uuid')
  .put(requireWrite, updateCode)
  .delete(requireWrite, deleteCode)

export default router