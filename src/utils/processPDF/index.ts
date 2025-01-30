import { ErrorResponse } from '@utils/errorResponse'
import { Attachment } from '@models/index'

// Types
import { NextFunction } from 'express'
import { FileInterface, FileTypeEnum } from '@models/types'

export default async (file: FileInterface, parentId: string, email: string | undefined, next: NextFunction): Promise<void> => { // Handle PDF upload
  const attachment = await Attachment.create({
    parentId,
    fileType: FileTypeEnum.pdf,
    data: file.buffer as unknown as Blob,
    createdBy: email,
    updatedBy: email
  })

  if(!attachment) {
    return next(new ErrorResponse("Unable to upload pdf", 500))
  }
}