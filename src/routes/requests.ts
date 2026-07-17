import { Router } from "express"
import { getRequests, getRequest, createRequest, updateRequest, deleteRequest } from "@controllers/requests"
import { entra } from "@middleware/auth"
import { requireWrite } from "@utils/requireRole"

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getRequests)
  .post(requireWrite, createRequest)

router
  .route('/:uuid')
  .get(getRequest)
  .put(requireWrite, updateRequest)
  .delete(requireWrite, deleteRequest)

export default router