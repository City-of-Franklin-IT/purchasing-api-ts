import { Router } from "express"
import { createCode, updateCode, deleteCode } from "@controllers/coding"
import { protect } from "@middleware/auth"

const router = Router()

router.use(protect)

router
  .route('/')
  .post(createCode)
  
router
  .route('/:uuid')
  .put(updateCode)
  .delete(deleteCode)

export default router