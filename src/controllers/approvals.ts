import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import setRequestStatus from '@utils/status/setRequestStatus'
import { Approval, Request } from '@models/index'
import { sendStatusEmail, sendPendingApprovalEmail } from '@utils/emails/automatedEmails'
import editorTracking from '@utils/editorTracking'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { UpdateApprovalRequest, UpdateApprovalResponse } from './types'
import { ApprovalInterface, RequestInterface } from '@models/types'

//@desc    Update request approval
//@route   PUT /api/v2/dept-purchasing/approvals/approval/update/:uuid
//@access  Private
export const updateApproval = asyncHandler(async (req: Req<{ uuid: string }, {}, UpdateApprovalRequest>, res: Response<UpdateApprovalResponse>, next: NextFunction) => {
  const { primaryApproval, primaryApprovalEmail, secondaryApproval, secondaryApprovalEmail, requiresAP } = req.body

  const approval = await Approval.update({
    primaryApproval,
    primaryApprovalEmail,
    secondaryApproval,
    secondaryApprovalEmail,
    requiresAP,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = approval

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update request approval by uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<ApprovalInterface> & ApprovalInterface)[])[0]

  const request = await Request.findOne({ // Reuturn request from database
    where: {
      requestId: data.requestId
    }
  }) as Model<RequestInterface> & RequestInterface

  const updatedRequest = await setRequestStatus(request.uuid, next) // Update request status

  if(!updatedRequest) {
    return next (new ErrorResponse(`Unable to update request status by request uuid ${ request.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Approval Updated',
    data
  })

  setImmediate(() => {
    try {
      if(updatedRequest.status === 'Pending Secondary Approval' && secondaryApprovalEmail) {
        sendPendingApprovalEmail([secondaryApprovalEmail], updatedRequest)
      }

      sendStatusEmail(updatedRequest)
    } catch (error) {
      console.error('Error sending approval emails:', error)
    }
  })
})