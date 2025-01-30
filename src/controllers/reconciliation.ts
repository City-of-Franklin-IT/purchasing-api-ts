import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Reconciliation, Request, Purchase } from '@models/index'
import setRequestStatus from '@utils/status/setRequestStatus'
import setPurchaseStatus from '@utils/status/setPurchaseStatus'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { PurchaseInterface, ReconciliationInterface, RequestInterface } from '@models/types'
import { UpdateReconciliationRequest, UpdateReconciliationResponse } from './types'

//@desc    Update reconciliation
//@route   PUT /api/v2/dept-purchasing/reconciliation/entry/update/:uuid
//@access  Private
export const updateReconciliation = asyncHandler(async (req: Req<{ uuid: string }, {}, UpdateReconciliationRequest>, res: Response<UpdateReconciliationResponse>, next: NextFunction) => {
  const { reconciled } = req.body

  const email = req.user?.email

  const reconciliation = await Reconciliation.update({
    reconciled,
    updatedBy: email
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = reconciliation

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update reconciliation entry by uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<ReconciliationInterface> & ReconciliationInterface)[])[0]

  const purchase = await Purchase.findOne({ // Associated purchase
    where: {
      uuid: data.parentId
    }
  }) as Model<PurchaseInterface> & PurchaseInterface

  if(!purchase) {
    return next(new ErrorResponse(`Unable to update purchase status by uuid ${ data.parentId }`, 500))
  }

  if(purchase.requestId) { // If associated to a request
    const request = await Request.findOne({
      where: {
        requestId: purchase.requestId
      }
    }) as Model<RequestInterface> & RequestInterface

    if(!request) {
      return next (new ErrorResponse(`Unable to update request status by requestId ${ purchase.requestId }`, 500))
    }

    await setRequestStatus(request.uuid, next) // Update request status
  } else await setPurchaseStatus(purchase.uuid, next) // Update purchase status

  res.status(200).json({
    success: true,
    msg: 'Reconciliation Updated',
    data
  })
})