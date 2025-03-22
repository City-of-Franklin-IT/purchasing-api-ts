import { Router } from "express"
import { getRequests, getRequest, createRequest, updateRequest, deleteRequest } from "@controllers/requests"
import { entra } from "@middleware/auth"

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getRequests)
  .post(createRequest)

router
  .route('/:uuid')
  .get(getRequest)
  .put(updateRequest)
  .delete(deleteRequest)

export default router