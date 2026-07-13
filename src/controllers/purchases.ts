import { Op } from 'sequelize'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Purchase, Request, Reconciliation, Attachment, OPIQ, Coding, Closed } from '@models/index'
import getFiscalYear from '@utils/getFiscalYear'
import setPurchaseStatus from '@utils/status/setPurchaseStatus'
import { triggerPowerAutomate } from '@utils/emails/powerAutomate'
import editorTracking from '@utils/editorTracking'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { PurchaseInterface, RequestInterface, StatusEnum } from '@models/types'
import { GetPurchasesResponse, GetPurchaseResponse, CreatePurchaseRequest, CreatePurchaseResponse, UpdatePurchaseRequest, UpdatePurchaseResponse, ControllerResponse } from './types'
import setRequestStatus from '@utils/status/setRequestStatus'

//@desc    Get purchases
//@route   GET /api/v2/dept-purchasing/purchases?department=&year=&createdBy=
//@access  Private
export const getPurchases = asyncHandler(async (req: Req<{}, {}, {}, { department: string, year: string, createdBy?: string }>, res: Response<GetPurchasesResponse>) => {
  const { department, year, createdBy } = req.query

  const createdAtFilter = Number(year) !== 1 ? {
    createdAt: {
      [Op.gte]: new Date(`${ Number(year) - 1 }-07-01`),
      [Op.lte]: new Date(`${ Number(year) }-06-30T23:59:59.999Z`)
    }
  } : undefined

  const setCreatedByFilter = (createdBy: string | undefined) => {
    if(!createdBy || req.entra?.roles.includes('task.admin')) return null

    return { createdBy }
  }

  const createdByFilter = setCreatedByFilter(createdBy)

  const purchases = await Purchase.findAll({
    where: {
      department,
      requestId: null,
      ...createdAtFilter,
      ...createdByFilter
    },
    include: [
      { model: Attachment,
        attributes: ['uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
      },
      { model: Reconciliation },
      { model: OPIQ },
      { model: Coding },
      { model: Closed }
    ]
  }) as (Model<PurchaseInterface> & PurchaseInterface)[]

  res.status(200).json({
    success: true,
    data: purchases
  })
})

//@desc    Get purchase
//@route   POST /api/v2/dept-purchasing/purchases/:uuid
//@access  Prviate
export const getPurchase = asyncHandler(async (req: Req<{ uuid: string }>, res: Response<GetPurchaseResponse>, next: NextFunction) => {
  const purchase = await Purchase.findOne({
    where: {
      uuid: req.params.uuid
    },
    include: [
      { model: Attachment,
        attributes: ['uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
      },
      { model: Reconciliation },
      { model: OPIQ },
      { model: Coding },
      { model: Closed }
    ]
  }) as Model<PurchaseInterface> & PurchaseInterface

  if(!purchase) {
    return next(new ErrorResponse(`Unable to return purchase by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    data: purchase
  })
})

//@desc    Create purchase
//@route   POST /api/v2/dept-purchasing/purchases
//@access  Private
export const createPurchase = asyncHandler(async (req: Req<{}, {}, CreatePurchaseRequest>, res: Response<CreatePurchaseResponse>, next: NextFunction) => {
  const { requestId, department, purchaseLocation, purchaseDetails, vendor, purchaseAmount, lastFour } = req.body

  const purchase = await Purchase.create({
    purchaseId: !requestId ? `PUR${ getFiscalYear() }${ department.toUpperCase() }-${ Math.floor(Date.now() / 1000) }` : null,
    requestId,
    department: department.toUpperCase(),
    purchaseLocation,
    purchaseDetails,
    vendor,
    purchaseAmount,
    lastFour,
    status: !requestId ? StatusEnum.Purchased : null,
    ...editorTracking(req)
  }) as Model<PurchaseInterface> & PurchaseInterface

  let emailBody

  if(requestId) { // If purchase has associated request - update status of request
    const request = await Request.findOne({
      where: {
        requestId
      }
    }) as Model<RequestInterface> & RequestInterface | null

    if(!request) {
      return next(new ErrorResponse(`Unable to update status for requestId ${ requestId }`, 404))
    }

    const updatedRequest = await setRequestStatus(request.uuid, next)

    if(!updatedRequest) {
      return next(new ErrorResponse(`Unable to update request status by request uuid ${ request.uuid }`, 404))
    }

    emailBody = updatedRequest
  } else emailBody = purchase

  res.status(201).json({
    success: true,
    msg: 'Purchase Created',
    data: purchase
  })

  if(!purchase.requestId) {
    setImmediate(() => triggerPowerAutomate('purchase_submission', purchase.purchaseId!))
  }
})

//@desc    Update purchase
//@route   PUT /api/v2/dept-purchasing/purchases/:uuid
//@access  Private
export const updatePurchase = asyncHandler(async (req: Req<{ uuid: string }, {}, UpdatePurchaseRequest>, res: Response<UpdatePurchaseResponse>, next: NextFunction) => {
  const { purchaseLocation, purchaseDetails, vendor, purchaseAmount, lastFour } = req.body

  const purchase = await Purchase.update({
    purchaseLocation,
    purchaseDetails,
    vendor,
    purchaseAmount,
    lastFour,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = purchase

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update purchase by uuid ${ req.params.uuid }`, 404))
  }

  const data = (affectedRows as (Model<PurchaseInterface> & PurchaseInterface)[])[0]

  if(data.requestId) { // If purchase has associated request - update status of request
    const request = await Request.findOne({
      where: {
        requestId: data.requestId
      }
    }) as Model<RequestInterface> & RequestInterface | null

    if(!request) {
      return next(new ErrorResponse(`Unable to update status for requestId ${ data.requestId }`, 404))
    }

    await setRequestStatus(request.uuid, next)
  } else setPurchaseStatus(data.uuid, next) // Update purchase status

  res.status(200).json({
    success: true,
    msg: 'Purchase Updated',
    data
  })
})

//@desc    Delete purchase
//@route   DELETE /api/v2/dept-purchasing/purchases/:uuid
//@access  Private
export const deletePurchase = asyncHandler(async (req: Req<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const purchase = await Purchase.findOne({
    where: {
      uuid: req.params.uuid
    }
  }) as Model<PurchaseInterface> & PurchaseInterface

  const result = await Purchase.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete purchase by uuid ${ req.params.uuid }`, 404))
  }

  if(purchase.requestId) { // Update associated request
    const request = await Request.findOne({
      where: {
        requestId: purchase.requestId
      }
    }) as Model<RequestInterface> & RequestInterface | null

    if(!request) {
      return next(new ErrorResponse(`Unable to update status for requestId ${ purchase.requestId }`, 404))
    }

    await setRequestStatus(request.uuid, next)
  }

  res.status(200).json({
    success: true,
    msg: 'Purchase Deleted'
  })
})