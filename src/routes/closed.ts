import { Router } from "express"
import { createClosed, updateClosed, deleteClosed } from "@controllers/closed"
import { entra } from "@middleware/auth"

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createClosed)

router
  .route('/:uuid')
  .put(updateClosed)
  .delete(deleteClosed)

export default router