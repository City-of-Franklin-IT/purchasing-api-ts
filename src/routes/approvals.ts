import { Router } from 'express'
import { createApproval, updateApproval } from '@controllers/approvals'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(requireWrite, createApproval)

router
  .route('/:uuid')
  .put(requireWrite, updateApproval)

export default router