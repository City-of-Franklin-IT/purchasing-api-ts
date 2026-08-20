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
import { ApprovalInterface, RequestInterface, StatusEnum } from '@models/types'

//@desc    Create request approval
//@route   POST /api/v2/dept-purchasing/approvals
//@access  Private
export const createApproval = asyncHandler(async (req: Req<{}, {}, CreateApprovalRequest>, res: Response<UpdateApprovalResponse>, next: NextFunction) => {
  const { requestId, approverEmail, isFinal, note } = req.body

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
    note,
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
  const { approverEmail, approval, isFinal, note } = req.body

  // Fetch old approval to track if approverEmail changed
  const oldApproval = await Approval.findOne({
    where: {
      uuid: req.params.uuid
    }
  }) as Model<ApprovalInterface> & ApprovalInterface | null

  if (!oldApproval) {
    return next(new ErrorResponse(`Unable to find approval with uuid ${ req.params.uuid }`, 404))
  }

  const oldApproverEmail = oldApproval.approverEmail

  const approval_result = await Approval.update({
    approverEmail,
    approval,
    isFinal,
    note,
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
      // Send pending_approval email if approverEmail has changed
      if(oldApproverEmail !== approverEmail) {
        triggerPowerAutomate('pending_approval', updatedRequest.requestId)
      }

      // Send status_change email if status changed
      if(updatedRequest.status !== previousStatus && updatedRequest.status !== StatusEnum.Pending) {
        triggerPowerAutomate('status_change', updatedRequest.requestId)
      }
    })
  }
})