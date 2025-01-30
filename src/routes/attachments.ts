import { Router } from "express"
import multer from "multer"
import { createAttachment, getAttachment, deleteAttachment } from "@controllers/attachments"
import { protect } from "@middleware/auth"

const router = Router()

router.use(protect)

router
  .post('/', multer().single('file'), createAttachment)

router
  .route('/:uuid')
  .get(getAttachment)
  .delete(deleteAttachment)

export default router