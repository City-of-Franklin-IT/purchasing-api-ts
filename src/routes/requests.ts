import { Router } from "express"
import { getRequests, getRequest, createRequest, updateRequest, deleteRequest } from "@controllers/requests"
import { protect } from "@middleware/auth"

const router = Router()

router.use(protect)

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