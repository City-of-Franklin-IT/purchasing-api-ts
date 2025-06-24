import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Request, Approval, Purchase, Attachment, Reconciliation, OPIQ, Coding, Closed, Delegate } from '@models/index'
import getFiscalYear from '@utils/getFiscalYear'
import { bindServiceAcct } from '@utils/ldap'
import setRequestStatus from '@utils/status/setRequestStatus'
import { adminSearch, parksLookup } from '@utils/ldap/ldapLookups'
import { sendPendingApprovalEmail } from '@utils/emails/automatedEmails'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { Client } from 'ldapjs'
import { RequestInterface, DepartmentEnum } from '@models/types'
import { GetRequestsResponse, GetRequestResponse, CreateRequestRequest, CreateRequestResponse, ControllerResponse } from './types'

// @desc    Get requests
// @route   GET /api/v2/dept-purchasing/requests?department=
// @access  Private
export const getRequests = asyncHandler(async (req: Req<{}, {}, {}, { department: string }>, res: Response<GetRequestsResponse>, next: NextFunction) => {
  const department = req.query.department.toUpperCase()

  const requests = await Request.findAll({
    where: {
      department: DepartmentEnum[department as DepartmentEnum]
    },
    include: [
      { model: Purchase,
        include: [
          { model: Attachment,
            attributes: ['fileType', 'uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
          },
          { model: Reconciliation },
          { model: OPIQ },
          { model: Coding },
          { model: Closed }
        ]
      },
      { model: Approval },
      { model: Attachment,
        attributes: ['fileType', 'uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
      },
      { model: Delegate }
    ]
  }) as (Model<RequestInterface> & RequestInterface)[]

  res.status(200).json({
    success: true,
    data: requests
  })
})

// @desc    Get request
// @route   GET /api/v2/dept-purchasing/requests/request/:uuid
// @access  Private
export const getRequest = asyncHandler(async (req: Req<{ uuid: string }>, res: Response<GetRequestResponse>, next: NextFunction) => {

  const request = await Request.findOne({
    where: {
      uuid: req.params.uuid
    },
    include: [
      { model: Purchase,
        include: [
          { model: Attachment,
            attributes: ['fileType', 'uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
          },
          { model: Reconciliation },
          { model: OPIQ },
          { model: Coding },
          { model: Closed }
        ]
      },
      { model: Approval },
      { model: Attachment,
        attributes: ['fileType', 'uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
      },
      { model: Delegate }
    ]
  }) as Model<RequestInterface> & RequestInterface

  if(!request) {
    return next(new ErrorResponse(`Unable to return request by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: request
  })
})

// @desc    Create request
// @route   POST /api/v2/dept-purchasing/requests
// @access  Private
export const createRequest = asyncHandler(async (req: Req<{}, {}, CreateRequestRequest>, res: Response<CreateRequestResponse>, next: NextFunction) => {
  const { department, requestLocation, requestDetails, vendor, requestAmount, weblink } = req.body

  const email = req.entra?.preferred_username

  const request = await Request.create({
    requestId: `REQ${ getFiscalYear() }${ department.toUpperCase() }-${ Math.floor(Date.now() / 1000) }`,
    department,
    requestLocation,
    requestDetails,
    vendor,
    requestAmount,
    weblink,
    createdBy: email,
    updatedBy: email
  }) as Model<RequestInterface> & RequestInterface

  if(!request) {
    return next(new ErrorResponse("Unable to create new request", 500))
  }

  if(process.env.NODE_ENV === 'production') { // Automated emails
    const client = await bindServiceAcct() as Client

    if(department.toUpperCase() === 'FIRE') { // Fire
      const admins = await adminSearch(department, client) as string[]

      if(admins) {
        sendPendingApprovalEmail(admins, request)
      }
    }
  }

  const { requestId } = request

  const approval = await Approval.create({
    requestId,
    createdBy: email,
    updatedBy: email
  })

  if(!approval) {
    return next(new ErrorResponse(`Unable to create approval entry for requestId ${ requestId }`, 500))
  }

  res.status(201).json({
    success: true,
    msg: 'Request Created',
    data: request
  })
})

//@desc    Update Request
//@route   PUT /api/v2/dept-purchasing/requests/:uuid
//@access  Private
export const updateRequest = asyncHandler(async (req: Req<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { requestLocation, requestDetails, vendor, requestAmount, weblink,  updatedAt } = req.body

  const email = req.entra?.preferred_username

  const request = await Request.update({
    requestLocation,
    requestDetails,
    vendor,
    requestAmount,
    weblink,
    updatedBy: email,
    updatedAt
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  const [affectedCount] = request

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update request by uuid ${ req.params.uuid }`, 500))
  }

  setRequestStatus(req.params.uuid, next)

  res.status(200).json({
    success: true,
    msg: 'Request Updated'
  })
})

//@desc    Delete request
//@route   DELETE /api/v2/dept-purchasing/requests/:uuid
//@access  Private
export const deleteRequest = asyncHandler(async (req: Req<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Request.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete request by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Request Deleted'
  })
})