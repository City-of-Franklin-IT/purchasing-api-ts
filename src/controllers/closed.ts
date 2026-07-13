import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Closed, Purchase, Request } from '@models/index'
import setPurchaseStatus from '@utils/status/setPurchaseStatus'
import setRequestStatus from '@utils/status/setRequestStatus'
import editorTracking from '@utils/editorTracking'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ClosedInterface, PurchaseInterface, RequestInterface } from '@models/types'
import { ControllerResponse, CreateClosedRequest, UpdateClosedRequest } from './types'

//@desc    Create Closed entry
//@route   POST /api/v2/dept-purchasing/closed
//@access  Private
export const createClosed = asyncHandler(async (req: Req<{}, {}, CreateClosedRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { parentId, comments } = req.body

  const result = await Closed.create({
    parentId,
    comments,
    ...editorTracking(req)
  }) as Model<ClosedInterface> & ClosedInterface

  const purchase = await Purchase.findOne({
    where: {
      uuid: parentId
    }
  }) as Model<PurchaseInterface> & PurchaseInterface | null

  if(!purchase) {
    return next(new ErrorResponse(`Unable to return purchase by uuid ${ parentId }`, 404))
  }

  if(purchase.requestId) { // If purchase has associated request - update status of request
    const request = await Request.findOne({
      where: {
        requestId: purchase.requestId
      }
    }) as Model<RequestInterface> & RequestInterface

    await setRequestStatus(request.uuid, next) // Update request status
  } else await setPurchaseStatus(purchase.uuid, next) // Update purchase status

  res.status(201).json({
    success: true,
    msg: "Closed"
  })
})

//@desc    Update Closed entry
//@route   PUT /api/v2/dept-purchasing/closed/:uuid
//@access  Private
export const updateClosed = asyncHandler(async (req: Req<{ uuid: string }, {}, UpdateClosedRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { comments } = req.body

  const result = await Closed.update({
    comments,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  const [affectedCount] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update closed entry by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: "Updated"
  })
})

//@desc    Delete Closed entry
//@route   DELETE /api/v2/dept-purchasing/closed/:uuid
//@access  Private
export const deleteClosed = asyncHandler(async (req: Req<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const closed = await Closed.findOne({
    where: {
      uuid: req.params.uuid
    }
  }) as Model<ClosedInterface> & ClosedInterface | null

  if(!closed) {
    return next(new ErrorResponse(`Unable to return closed entry by uuid ${ req.params.uuid }`, 404))
  }

  const result = await Closed.destroy({ // Delete closed entry
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete closed entry by uuid ${ req.params.uuid }`, 404))
  }

  const purchase = await Purchase.findOne({ // Associated purchase
    where: {
      uuid: closed.parentId
    }
  }) as Model<PurchaseInterface> & PurchaseInterface | null

  if(!purchase) {
    return next(new ErrorResponse(`Unable to return purchase by uuid ${ closed.parentId }`, 404))
  }

  if(purchase.requestId) { // If purchase has associated request - update status of request
    const request = await Request.findOne({
      where: {
        requestId: purchase.requestId
      }
    }) as Model<RequestInterface> & RequestInterface | null

    if(!request) {
      return next(new ErrorResponse(`Unable to return request by requestId ${ purchase.requestId }`, 404))
    }

    await setRequestStatus(request.uuid, next) // Update request status
  } else await setPurchaseStatus(purchase.uuid, next) // Update purchase status

  res.status(200).json({
    success: true,
    msg: "Closed Entry Deleted"
  })
})