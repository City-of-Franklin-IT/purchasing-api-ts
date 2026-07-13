import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import setRequestStatus from '@utils/status/setRequestStatus'
import { Approval, Request } from '@models/index'
import { triggerPowerAutomate } from '@utils/emails/powerAutomate'
import editorTracking from '@utils/editorTracking'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { CreateApprovalRequest, UpdateApprovalRequest, UpdateApprovalResponse } from './types'
import { ApprovalInterface, RequestInterface } from '@models/types'

//@desc    Create request approval
//@route   POST /api/v2/dept-purchasing/approvals
//@access  Private
export const createApproval = asyncHandler(async (req: Req<{}, {}, CreateApprovalRequest>, res: Response<UpdateApprovalResponse>, next: NextFunction) => {
  const { requestId, approverEmail, isFinal } = req.body

  const request = (await Request.findOne({
    where: {
      requestId
    }
  })) as Model<RequestInterface> & RequestInterface | null

  if (!request) {
    return next(new ErrorResponse(`Unable to find request with requestId ${ requestId }`, 404))
  }

  const approval = await Approval.create({
    requestId,
    approverEmail,
    isFinal,
    ...editorTracking(req)
  }) as Model<ApprovalInterface> & ApprovalInterface

  const updatedRequest = await setRequestStatus(request.uuid, next)

  if (!updatedRequest) {
    return next(new ErrorResponse(`Unable to update request status by request uuid ${ request.uuid }`, 500))
  }

  res.status(201).json({
    success: true,
    msg: 'Approval Created',
    data: approval
  })

  setImmediate(() => {
    triggerPowerAutomate('pending_approval', updatedRequest.requestId)
  })
})

//@desc    Update request approval
//@route   PUT /api/v2/dept-purchasing/approvals/:uuid
//@access  Private
export const updateApproval = asyncHandler(async (req: Req<{ uuid: string }, {}, UpdateApprovalRequest>, res: Response<UpdateApprovalResponse>, next: NextFunction) => {
  const { approval, isFinal } = req.body

  const approval_result = await Approval.update({
    approval,
    isFinal,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = approval_result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update request approval by uuid ${ req.params.uuid }`, 404))
  }

  const data = (affectedRows as (Model<ApprovalInterface> & ApprovalInterface)[])[0]

  res.status(200).json({
    success: true,
    msg: 'Approval Updated',
    data
  })

  const request = await Request.findOne({
    where: {
      requestId: data.requestId
    }
  }) as Model<RequestInterface> & RequestInterface

  const previousStatus = request.status

  const updatedRequest = await setRequestStatus(request.uuid, next)

  if(updatedRequest) {
    setImmediate(() => {
      if(updatedRequest.status === 'Pending Secondary Approval') {
        triggerPowerAutomate('pending_approval', updatedRequest.requestId)
      }
      if(updatedRequest.status !== previousStatus) {
        triggerPowerAutomate('status_change', updatedRequest.requestId)
      }
    })
  }
})