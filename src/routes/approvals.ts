import { Router } from 'express'
import { updateApproval } from '@controllers/approvals'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

router
  .route('/:uuid')
  .put(updateApproval)

export default router