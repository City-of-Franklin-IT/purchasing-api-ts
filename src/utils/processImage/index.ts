import sharp from 'sharp'
import { ErrorResponse } from '@utils/errorResponse'
import { Attachment } from '@models/index'

// Types
import { NextFunction } from 'express'
import { ModelStatic, Model } from 'sequelize'
import { FileInterface, FileTypeEnum } from '@models/types'

export default async (file: FileInterface, parentId: string, email: string | undefined, next: NextFunction): Promise<void> => { // Handle image upload

  sharp(file.buffer)
    .resize(960, 640, {
      fit: 'inside'
    })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
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