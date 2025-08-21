import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Delegate, Request } from '@models/index'
import { sendStatusEmail } from '@utils/emails/automatedEmails'
import editorTracking from '@utils/editorTracking'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { DelegateInterface, RequestInterface } from '@models/types'
import { ControllerResponse, CreateDelegateRequest, CreateDelegateResponse, UpdateDelegateRequest, UpdateDelegateResponse } from './types'

//@desc    Create Delegate
//@route   POST /api/v2/dept-purchasing/delegate/create
//@access  Private
export const createDelegate = asyncHandler(async (req: Req<{}, {}, CreateDelegateRequest>, res: Response<CreateDelegateResponse>, next: NextFunction) => {
  const { requestId } = req.body

  const delegate = await Delegate.create({
    requestId,
    ...editorTracking(req)
  }) as Model<DelegateInterface> & DelegateInterface

  if(!delegate) {
    return next(new ErrorResponse(`Unable to create delegate entry for request ${ requestId }`, 500))
  }

  res.status(201).json({
    success: true,
    data: delegate
  })
})

//@desc    Update Delegate
//@route   PUT /api/v2/dept-purchasing/delegate/update/:uuid  
//@access  Private
export const updateDelegate = asyncHandler(async (req: Req<{ uuid: string }, {}, UpdateDelegateRequest>, res: Response<UpdateDelegateResponse>, next: NextFunction) => {
  const { delegateEmail } = req.body

  const delegate = await Delegate.update({
    delegateEmail,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = delegate

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update delegate entry by uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<DelegateInterface> & DelegateInterface)[])[0]

  const request = await Request.findOne({
    where: {
      requestId: data.requestId
    },
    include: {
      model: Delegate
    }
  }) as Model<RequestInterface> & RequestInterface

  sendStatusEmail(request)

  res.status(200).json({
    success: true,
    data
  })
})

//@desc    Delete Delegate
//@route   DELETE /api/v2/dept-purchasing/delegate/delete/:uuid
//@access  Private
export const deleteDelegate = asyncHandler(async (req: Req<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Delegate.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete delgate entry by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Delete Entry Deleted'
  })
})