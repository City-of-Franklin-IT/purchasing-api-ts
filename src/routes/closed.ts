import { Router } from "express"
import { createClosed, updateClosed, deleteClosed } from "@controllers/closed"
import { entra } from "@middleware/auth"
import { requireWrite } from "@utils/requireRole"

const router = Router()

router.use(entra)

router
  .route('/')
  .post(requireWrite, createClosed)

router
  .route('/:uuid')
  .put(requireWrite, updateClosed)
  .delete(requireWrite, deleteClosed)

export default router