import { Op } from 'sequelize'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Request, Approval, Purchase, Attachment, Reconciliation, OPIQ, Coding, Closed, Delegate } from '@models/index'
import getFiscalYear from '@utils/getFiscalYear'
import setRequestStatus from '@utils/status/setRequestStatus'
import editorTracking from '@utils/editorTracking'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { RequestInterface, StatusEnum } from '@models/types'
import { GetRequestsResponse, GetRequestResponse, CreateRequestRequest, CreateRequestResponse, ControllerResponse } from './types'

// @desc    Get requests
// @route   GET /api/v2/dept-purchasing/requests?department=
// @access  Private
export const getRequests = asyncHandler(async (req: Req<{}, {}, {}, { department: string, year: string }>, res: Response<GetRequestsResponse>) => {
  const { department, year } = req.query

  const createdAtFilter = Number(year) !== 1 ? {
    createdAt: {
      [Op.gte]: new Date(`${ Number(year) - 1 }-07-01`),
      [Op.lte]: new Date(`${ Number(year) }-06-30T23:59:59.999Z`)
    }
  } : undefined

  const requests = await Request.findAll({
    where: {
      department,
      ...createdAtFilter
    },
    include: [
      { model: Purchase,
        include: [
          { model: Attachment,
            attributes: ['uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
          },
          { model: Reconciliation },
          { model: OPIQ },
          { model: Coding },
          { model: Closed }
        ]
      },
      { model: Approval },
      { model: Attachment,
        attributes: ['uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
      },
      { model: Delegate }
    ]
  }) as (Model<RequestInterface> & RequestInterface)[]

  // Filter police requests to only those created by the logged in user, or pending the logged in user's approval, unless admin
  if(department.toLowerCase() === "police" && !req.entra?.roles.some(role => ["task.admin", "task.sudo", "task.chief"].includes(role))) {
    const preferredUsername = req.entra?.preferred_username.toLowerCase()

    const filtered = requests.filter(request =>
      request.createdBy.toLowerCase() === preferredUsername ||
      (request.status === StatusEnum.Pending && request.Approvals?.some(approval => approval.approverEmail.toLowerCase() === preferredUsername))
    )

    return res.status(200).json({
      success: true,
      data: filtered
    })
  }

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
            attributes: ['uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
          },
          { model: Reconciliation },
          { model: OPIQ },
          { model: Coding },
          { model: Closed }
        ]
      },
      { model: Approval },
      { model: Attachment,
        attributes: ['uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
      },
      { model: Delegate }
    ]
  }) as Model<RequestInterface> & RequestInterface | null

  if(!request) {
    return next(new ErrorResponse(`Unable to return request by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    data: request
  })
})

// @desc    Create request
// @route   POST /api/v2/dept-purchasing/requests
// @access  Private
export const createRequest = asyncHandler(async (req: Req<{}, {}, CreateRequestRequest>, res: Response<CreateRequestResponse>) => {
  const { department, requestLocation, requestDetails, vendor, requestAmount, weblink } = req.body

  const request = await Request.create({
    requestId: `REQ${ getFiscalYear() }${ department.toUpperCase() }-${ Math.floor(Date.now() / 1000) }`,
    department: department.toUpperCase(),
    requestLocation,
    requestDetails,
    vendor,
    requestAmount,
    weblink,
    ...editorTracking(req)
  }) as Model<RequestInterface> & RequestInterface

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
  const { requestLocation, requestDetails, vendor, requestAmount, weblink, requiresAP } = req.body

  const request = await Request.update({
    requestLocation,
    requestDetails,
    vendor,
    requestAmount,
    weblink,
    requiresAP,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  const [affectedCount] = request

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update request by uuid ${ req.params.uuid }`, 404))
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
    return next(new ErrorResponse(`Unable to delete request by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: 'Request Deleted'
  })
})