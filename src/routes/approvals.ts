import { Router } from 'express'
import { updateApproval } from '@controllers/approvals'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/:uuid')
  .put(updateApproval)

export default router