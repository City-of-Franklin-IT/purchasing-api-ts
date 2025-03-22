import { Router } from "express"
import { createDelegate, updateDelegate, deleteDelegate } from "@controllers/delegates"
import { entra } from "@middleware/auth"

const router = Router()

router.use(entra)

router
  .post('/', createDelegate)

router
  .route('/:uuid')
  .put(updateDelegate)
  .delete(deleteDelegate)

export default router