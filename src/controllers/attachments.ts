import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Attachment } from '@models/index'
import processImage from '@utils/processImage'
import processPDF from '@utils/processPDF'
import determineFileType from '@utils/determineFileType'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { AttachmentInterface, FileInterface } from '@models/types'
import { ControllerResponse, CreateAttachmentRequest, GetAttachmentResponse } from './types'

//@desc    Get attachment
//@route   GET /api/v2/dept-purchasing/attachments/attachment/:uuid
//@access  Private
export const getAttachment = asyncHandler(async (req: Req<{ uuid: string }>, res: Response<GetAttachmentResponse>, next: NextFunction) => {
  const attachment = await Attachment.findOne({
    where: {
      uuid: req.params.uuid
    },
  }) as Model<AttachmentInterface> & AttachmentInterface

  if(!attachment) {
    return next(new ErrorResponse(`Unable to download attachment by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Attachment Downloaded',
    data: attachment
  })
})

//@desc    Create attachment
//@route   POST /api/v2/dept-purchasing/attachments
//@access  Private
export const createAttachment = asyncHandler(async (req: Req<{}, {}, CreateAttachmentRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { file } = req
  const { parentId } = req.body

  const email = process.env.NODE_ENV === 'development' ? 'test.o365-3@franklintn.gov' : req.entra?.preferred_username

  const fileType = determineFileType(file?.buffer)

  if(!fileType) {
    return next(new ErrorResponse("Unable to upload file - wrong file type", 500))
  }

  if(fileType.type === 'image') { 
    processImage(file as unknown as FileInterface, parentId, email, next) // Image
  } else processPDF(file as unknown as FileInterface, parentId, email, next) // PDF

  res.status(201).json({
    success: true,
    msg: 'File uploaded'
  })
})

//@desc    Delete attachment
//@route   DELETE /api/v2/dept-purchasing/attachments/attachment/delete/:uuid
//@access  Private
export const deleteAttachment = asyncHandler(async (req: Req<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Attachment.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete attachment by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Attachment Deleted'
  })
})