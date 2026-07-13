import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Reconciliation, Request, Purchase } from '@models/index'
import setRequestStatus from '@utils/status/setRequestStatus'
import setPurchaseStatus from '@utils/status/setPurchaseStatus'
import editorTracking from '@utils/editorTracking'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { PurchaseInterface, ReconciliationInterface, RequestInterface } from '@models/types'
import { CreateReconciliationRequest, CreateReconciliationResponse } from './types'

//@desc    Create reconciliation
//@route   POST /api/v2/dept-purchasing/reconciliation
//@access  Private
export const createReconciliation = asyncHandler(async (req: Req<{}, {}, CreateReconciliationRequest>, res: Response<CreateReconciliationResponse>, next: NextFunction) => {
  const reconciliation = await Reconciliation.create({
    parentId: req.body.parentId,
    ...editorTracking(req)
  })

  const data = reconciliation as Model<ReconciliationInterface> & ReconciliationInterface

  const purchase = await Purchase.findOne({
    where: {
      uuid: data.parentId
    }
  }) as Model<PurchaseInterface> & PurchaseInterface | null

  if(!purchase) {
    return next(new ErrorResponse(`Unable to find purchase by uuid ${ data.parentId }`, 404))
  }

  if(purchase.requestId) { // If associated to a request
    const request = await Request.findOne({
      where: {
        requestId: purchase.requestId
      }
    }) as Model<RequestInterface> & RequestInterface | null

    if(!request) {
      return next (new ErrorResponse(`Unable to find request by requestId ${ purchase.requestId }`, 404))
    }

    await setRequestStatus(request.uuid, next) // Update request status
  } else await setPurchaseStatus(purchase.uuid, next) // Update purchase status

  res.status(201).json({
    success: true,
    msg: 'Reconciliation Created',
    data
  })
})