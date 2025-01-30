import { Request } from "@models/index"
import { PurchaseInterface, RequestInterface } from "@models/types"

// Types
import { ModelStatic, Model } from "sequelize"

export default async (uuid: string, model: ModelStatic<Model>) => {
  const result = await model.findOne({
    where: {
      uuid
    }
  })

  let newStatus

  if(model === Request) {
    newStatus = determineRequestStatus(result as Model<RequestInterface>)
  } else newStatus = determinePurchaseStatus(result as Model<PurchaseInterface>)

  const updated = await model.update({ // Update status
    status: newStatus
  },{
    where: {
      uuid
    },
    returning: true
  })

  const data = updated[1][0].dataValues

  return data
}

const determineRequestStatus = (result: Model<RequestInterface>): string | undefined => {
  const { Approval, Purchase } = result.dataValues

  if(Purchase) { // Handle requests with associated purchases
    if(Purchase.Closed) {
      return 'Closed'
    }

    if(Purchase.Reconciliation?.reconciled) { 
      return 'Completed'
    }

    return 'Purchased' 
  }

  let approvalStatus

  if(Approval?.primaryApproval === false) { // Denied by primary approver
    approvalStatus = 'Denied' 
  }

  if(Approval?.primaryApproval) { // Request has primary approval
    if(Approval.secondaryApprovalEmail) { // Requires secondary approval
      if(Approval?.secondaryApproval === null) {
        approvalStatus = 'Pending Secondary Approval'
      }

      if(Approval.secondaryApproval) { 
        approvalStatus = 'Approved'
      } 
      
      if(Approval.secondaryApproval === false) {
        approvalStatus = 'Denied'
      }
    } else approvalStatus = 'Approved' // Approved - no secondary approval required
  }
  
  if(approvalStatus === 'Approved') {
    if(Approval?.requiresAP) { // Approved for AP purchase
      return 'Approved For AP'
    } else return 'Approved' // Approved
  }

  return approvalStatus // Return any non approved status
}

const determinePurchaseStatus = (result: Model<PurchaseInterface>): 'Closed' | 'Completed' | 'Purchased' => {
  const { Reconciliation, Closed } = result.dataValues

  if(Closed) { // Closed
    return 'Closed'
  }

  if(Reconciliation?.reconciled) { // Completed
    return 'Completed'
  }

  return 'Purchased' // Purchased
}