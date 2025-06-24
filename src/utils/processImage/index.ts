import sharp from 'sharp'
import { ErrorResponse } from '@utils/errorResponse'
import { Attachment } from '@models/index'

// Types
import { NextFunction } from 'express'
import { Metadata } from 'sharp'
import { FileInterface, FileTypeEnum } from '@models/types'

export default async (file: FileInterface, parentId: string, email: string | undefined, next: NextFunction): Promise<void> => { // Handle image upload
  const metadata = await sharp(file.buffer).metadata()

  const orientation = getOrientation(metadata)

  sharp(file.buffer)
    .rotate()
    .toFormat('jpeg')
    .jpeg()
    .resize(orientation.width, orientation.height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toBuffer(async (err, buffer, info) => {

      if(err) {
        return next(new ErrorResponse("Unable to upload image", 500))
      }

      const image = await Attachment.create({
        parentId,
        fileType: FileTypeEnum.jpeg,
        data: buffer as unknown as Blob,
        createdBy: email,
        updatedBy: email
      })

      if(!image) {
        return next(new ErrorResponse("Unable to upload image", 500))
      }
    })
}

const getOrientation = (metadata: Metadata) => {
  return (metadata.orientation || 0) >= 5 ? { width: 640, height: 960 } : { width: 960, height: 640 }
}