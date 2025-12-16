import { Router } from "express"
import multer from "multer"
import { ErrorResponse } from "@utils/errorResponse"
import { createAttachment, getAttachment, deleteAttachment } from "@controllers/attachments"
import { entra } from "@middleware/auth"

const router = Router()

router.use(entra)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    cb(null, true)
  }
}).single('file')

router
  .post('/', (req, res, next) => {
    upload(req, res, (err) => {
      if(err) {
        return next(new ErrorResponse('Attachment upload failed', 400))
      }
      next()
    })
  }, createAttachment)

router
  .route('/:uuid')
  .get(getAttachment)
  .delete(deleteAttachment)

export default router