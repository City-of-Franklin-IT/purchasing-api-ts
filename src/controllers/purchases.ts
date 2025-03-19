import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Purchase, Request, Reconciliation, Attachment, OPIQ, Coding, Closed } from '@models/index'
import getFiscalYear from '@utils/getFiscalYear'
import setPurchaseStatus from '@utils/status/setPurchaseStatus'
import { bindServiceAcct } from '@utils/ldap'
import { adminSearch, parksLookup } from '@utils/ldap/ldapLookups'
import { sendPurchaseEmail } from '@utils/emails/automatedEmails'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { Client } from 'ldapjs'
import { DepartmentEnum, PurchaseInterface, RequestInterface, StatusEnum } from '@models/types'
import { GetPurchasesResponse, GetPurchaseResponse, CreatePurchaseRequest, CreatePurchaseResponse, UpdatePurchaseRequest, UpdatePurchaseResponse, ControllerResponse } from './types'
import setRequestStatus from '@utils/status/setRequestStatus'

//@desc    Get purchases
//@route   GET /api/v2/dept-purchasing/purchases?department=
//@access  Private
export const getPurchases = asyncHandler(async (req: Req<{}, {}, {}, { department: string }>, res: Response<GetPurchasesResponse>, next: NextFunction) => {
  const department = req.query.department.toUpperCase()

  const purchases = await Purchase.findAll({
    where: {
      department: DepartmentEnum[department as DepartmentEnum],
      requestId: null
    },
    include: [
      { model: Attachment,
        attributes: ['fileType', 'uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
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
        attributes: ['fileType', 'uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
      },
      { model: Reconciliation },
      { model: OPIQ },
      { model: Coding },
      { model: Closed }
    ]
  }) as Model<PurchaseInterface> & PurchaseInterface

  if(!purchase) {
    return next(new ErrorResponse(`Unable to return purchase by uuid ${ req.params.uuid }`, 500))
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

  const email = req.user?.email

  const purchase = await Purchase.create({
    purchaseId: !requestId ? `PUR${ getFiscalYear() }${ department }-${ Math.floor(Date.now() / 1000) }` : null,
    requestId,
    department,
    purchaseLocation,
    purchaseDetails,
    vendor,
    purchaseAmount,
    lastFour,
    status: !requestId ? StatusEnum.Purchased : null,
    createdBy: email, 
    updatedBy: email
  }) as Model<PurchaseInterface> & PurchaseInterface

  if(!purchase) {
    return next(new ErrorResponse('Unable to create new purchase', 500))
  }

  let emailBody

  if(requestId) { // If purchase has associated request - update status of request
    const request = await Request.findOne({
      where: {
        requestId
      }
    }) as Model<RequestInterface> & RequestInterface

    if(!request) {
      return next(new ErrorResponse(`Unable to update status for requestId ${ requestId }`, 500))
    }

    const updatedRequest = await setRequestStatus(request.uuid, next)

    if(!updatedRequest) {
      return next(new ErrorResponse(`Unable to update request status by request uuid ${ request.uuid }`, 500))
    }

    emailBody = updatedRequest
  } else emailBody = purchase

  if(process.env.NODE_ENV === 'production') { // Automated emails
    const client = await bindServiceAcct() as Client

    if(department === 'FIRE') { // Fire

      const admins = await adminSearch(department, client) as string[]

      if(admins) {
        sendPurchaseEmail(admins, emailBody as Model<PurchaseInterface> & PurchaseInterface)
      }
    }
  
    if(department === 'PARKS') { // Parks
      const emails = await parksLookup(email as string, client)

      if(emails) {
        sendPurchaseEmail(emails, emailBody as Model<PurchaseInterface> & PurchaseInterface)
      }
    }
  }

  const reconciliation = await Reconciliation.create({ // Create reconciliation entry
    parentId: purchase.uuid,
    createdBy: email,
    updatedBy: email
  })

  if(!reconciliation) {
    return next(new ErrorResponse("Could not create reconciliation entry for new purchase", 500))
  }

  res.status(201).json({
    success: true,
    msg: 'Purchase Created',
    data: purchase
  })
})

//@desc    Update purchase
//@route   PUT /api/v2/dept-purchasing/purchases/:uuid
//@access  Private
export const updatePurchase = asyncHandler(async (req: Req<{ uuid: string }, {}, UpdatePurchaseRequest>, res: Response<UpdatePurchaseResponse>, next: NextFunction) => {
  const { purchaseLocation, purchaseDetails, vendor, purchaseAmount, lastFour } = req.body

  const email = req.user?.email

  const purchase = await Purchase.update({
    purchaseLocation,
    purchaseDetails,
    vendor,
    purchaseAmount,
    lastFour,
    updatedBy: email
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = purchase

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update purchase by uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<PurchaseInterface> & PurchaseInterface)[])[0]

  if(data.requestId) { // If purchase has associated request - update status of request
    const request = await Request.findOne({
      where: {
        requestId: data.requestId
      }
    }) as Model<RequestInterface> & RequestInterface

    if(!request) {
      return next(new ErrorResponse(`Unable to update status for requestId ${ data.requestId }`, 500))
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
    return next(new ErrorResponse(`Unable to delete purchase by uuid ${ req.params.uuid }`, 500))
  }

  if(purchase.requestId) { // Update associated request
    const request = await Request.findOne({
      where: {
        requestId: purchase.requestId
      }
    }) as Model<RequestInterface> & RequestInterface

    if(!request) {
      return next(new ErrorResponse(`Unable to update status for requestId ${ purchase.requestId }`, 500))
    }

    await setRequestStatus(request.uuid, next)
  }

  res.status(200).json({
    success: true,
    msg: 'Purchase Deleted'
  })
})