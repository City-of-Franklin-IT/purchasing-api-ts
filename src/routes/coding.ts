import { Router } from "express"
import { createCode, updateCode, deleteCode } from "@controllers/coding"
import { protect, entra } from "@middleware/auth"

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createCode)
  
router
  .route('/:uuid')
  .put(updateCode)
  .delete(deleteCode)

export default router