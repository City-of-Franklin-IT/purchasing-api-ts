import { Router } from "express"
import { createDelegate, updateDelegate, deleteDelegate } from "@controllers/delegates"
import { protect } from "@middleware/auth"

const router = Router()

router.use(protect)

router
  .post('/', createDelegate)

router
  .route('/:uuid')
  .put(updateDelegate)
  .delete(deleteDelegate)

export default router