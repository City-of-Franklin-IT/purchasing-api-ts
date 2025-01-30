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
  const { Approval, Purchase } = request

  if(Purchase) { // Handle requests with associated purchases
    if(Purchase.Closed) {
      return StatusEnum.Closed
    }

    if(Purchase.Reconciliation?.reconciled) { 
      return StatusEnum.Completed
    }

    return StatusEnum.Purchased
  } else return handleRequestApprovalStatus(Approval as ApprovalInterface)
}

const handleRequestApprovalStatus = (Approval: ApprovalInterface) => {
  if(Approval?.primaryApproval === false) { // Denied
    return StatusEnum.Denied // Return Denied
  }

  let approvalStatus: StatusEnum = StatusEnum.Pending
  
  if(Approval?.primaryApproval) {
    if(Approval?.secondaryApprovalEmail) { // Requires secondary approval
      const secondaryApproval = Approval.secondaryApproval

      switch(secondaryApproval) {
        case true:
          approvalStatus = StatusEnum.Approved
        case false:
          approvalStatus = StatusEnum.Denied
        default:
          approvalStatus = StatusEnum.PendingSecondaryApproval
      }
    } else approvalStatus = StatusEnum.Approved

    if(approvalStatus === StatusEnum.Approved) {
      if(Approval.requiresAP) {
        approvalStatus = StatusEnum.ApprovedForAP
        return approvalStatus // Return Approved for AP
      } else return approvalStatus // Return Approved
    } else return approvalStatus // Return Denied | Pending Secondary Approval
  } else return approvalStatus // Return Pending
}