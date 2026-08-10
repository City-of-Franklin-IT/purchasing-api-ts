import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { EmergencyPurchase } from '@models/index'
import editorTracking from '@utils/editorTracking'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { EmergencyPurchaseInterface } from '@models/types'
import { ControllerResponse, CreateEmergencyRequest, CreateEmergencyResponse, UpdateEmergencyRequest, UpdateEmergencyResponse } from './types'

//@desc    Create Emergency Purchase entry
//@route   POST /api/v2/dept-purchasing/emergency
//@access  Private
export const createEmergency = asyncHandler(async (req: Req<{}, {}, CreateEmergencyRequest>, res: Response<CreateEmergencyResponse>) => {
  const { parentId, comments } = req.body

  const result = await EmergencyPurchase.create({
    parentId,
    comments,
    ...editorTracking(req)
  }) as Model<EmergencyPurchaseInterface> & EmergencyPurchaseInterface

  res.status(201).json({
    success: true,
    msg: 'Emergency Purchase Created',
    data: result
  })
})

//@desc    Update Emergency Purchase entry
//@route   PUT /api/v2/dept-purchasing/emergency/:uuid
//@access  Private
export const updateEmergency = asyncHandler(async (req: Req<{ uuid: string }, {}, UpdateEmergencyRequest>, res: Response<UpdateEmergencyResponse>, next: NextFunction) => {
  const { comments } = req.body

  const result = await EmergencyPurchase.update({
    comments,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update emergency purchase entry by uuid ${ req.params.uuid }`, 404))
  }

  const data = (affectedRows as (Model<EmergencyPurchaseInterface> & EmergencyPurchaseInterface)[])[0]

  res.status(200).json({
    success: true,
    msg: 'Emergency Purchase Updated',
    data
  })
})

//@desc    Delete Emergency Purchase entry
//@route   DELETE /api/v2/dept-purchasing/emergency/:uuid
//@access  Private
export const deleteEmergency = asyncHandler(async (req: Req<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await EmergencyPurchase.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete emergency purchase entry by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: 'Emergency Purchase Deleted'
  })
})
