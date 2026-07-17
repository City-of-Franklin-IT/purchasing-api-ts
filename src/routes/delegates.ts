import { Router } from "express"
import { createDelegate, updateDelegate, deleteDelegate } from "@controllers/delegates"
import { entra } from "@middleware/auth"
import { requireWrite } from "@utils/requireRole"

const router = Router()

router.use(entra)

router
  .post('/', requireWrite, createDelegate)

router
  .route('/:uuid')
  .put(requireWrite, updateDelegate)
  .delete(requireWrite, deleteDelegate)

export default router