import { Router } from 'express'
import { createApproval, updateApproval } from '@controllers/approvals'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createApproval)

router
  .route('/:uuid')
  .put(updateApproval)

export default router