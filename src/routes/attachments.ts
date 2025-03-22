import { Router } from "express"
import multer from "multer"
import { createAttachment, getAttachment, deleteAttachment } from "@controllers/attachments"
import { entra } from "@middleware/auth"

const router = Router()

router.use(entra)

router
  .post('/', multer().single('file'), createAttachment)

router
  .route('/:uuid')
  .get(getAttachment)
  .delete(deleteAttachment)

export default router