import { ErrorResponse } from "@utils/errorResponse"
import { Request, Approval, Purchase, Closed, Reconciliation } from "@models/index"

// Types
import { NextFunction } from "express"
import { Model } from "sequelize"
import { ApprovalInterface, RequestInterface, StatusEnum } from "@models/types"

export default async (uuid: string, next: NextFunction): Promise<Model<RequestInterface, RequestInterface> & RequestInterface|void> => {
  const request = await Request.findOne({
    where: {
      uuid
    },
    include: [
      { model: Approval },
      { model: Purchase,
        include: [
          { model: Closed },
          { model: Reconciliation }
        ]
      }
    ]
  }) as Model<RequestInterface> & RequestInterface

  const newStatus = determineRequestStatus(request)

  const updated = await Request.update({
    status: newStatus
  },{
    where: {
      uuid
    },
    returning: true
  }) 

  const [affectedCount, affectedRows] = updated

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update request by uuid ${ uuid }`, 500))
  }

  const data = (affectedRows as (Model<RequestInterface> & RequestInterface)[])[0]

  return data
}

const determineRequestStatus = (request: Model<RequestInterface> & RequestInterface): StatusEnum => {
  const { Approvals, Purchase, requiresAP } = request

  if(Purchase) { // Handle requests with associated purchases
    if(Purchase.Closed) {
      return StatusEnum.Closed
    }

    if(Purchase.Reconciliation?.reconciled) {
      return StatusEnum.Completed
    }

    return StatusEnum.Purchased
  } else return handleRequestApprovalStatus(Approvals as ApprovalInterface[], requiresAP)
}

const handleRequestApprovalStatus = (approvals: ApprovalInterface[] | undefined, requiresAP: boolean): StatusEnum => {
  if (!approvals || approvals.length === 0) {
    return StatusEnum.Pending
  }

  if (approvals.some(a => a.approval === false)) {
    return StatusEnum.Denied
  }

  const isFinalApprover = approvals.find(a => a.isFinal)
  const allApproved = approvals.every(a => a.approval === true)

  if (allApproved && !isFinalApprover) {
    return requiresAP ? StatusEnum.ApprovedForAP : StatusEnum.Approved
  }

  if (isFinalApprover) {
    if (isFinalApprover.approval === false) {
      return StatusEnum.Denied
    }
    if (isFinalApprover.approval === true) {
      return requiresAP ? StatusEnum.ApprovedForAP : StatusEnum.Approved
    }
    return approvals.some(a => a.approval === true) ? StatusEnum.PendingSecondaryApproval : StatusEnum.Pending
  }

  if (approvals.some(a => a.approval === true)) {
    return StatusEnum.Pending
  }

  return StatusEnum.Pending
}