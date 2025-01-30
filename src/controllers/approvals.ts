import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import setStatus from '@utils/setStatus'
import { Approval, Request } from '@models/index'
import { sendStatusEmail, sendPendingApprovalEmail } from '@utils/emails/automatedEmails'

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

  const email = req.user?.email

  const approval = await Approval.update({
    primaryApproval,
    primaryApprovalEmail,
    secondaryApproval,
    secondaryApprovalEmail,
    requiresAP,
    updatedBy: email
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

  const result = await setStatus(request.uuid, Request) // Update request status

  if(result.status === 'Pending Secondary Approval' && secondaryApprovalEmail) {
    sendPendingApprovalEmail([secondaryApprovalEmail], result)
  }

  sendStatusEmail(result)

  res.status(200).json({
    success: true,
    msg: 'Approval Updated',
    data
  })
})