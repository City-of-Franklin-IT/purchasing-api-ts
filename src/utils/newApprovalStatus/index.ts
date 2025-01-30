// Types
import { ApprovalInterface } from "@models/types"

export default (approval: ApprovalInterface) => {
  const { primaryApproval, secondaryApproval, secondaryApprovalEmail, requiresAP } = approval

  let status

  if(primaryApproval === null) { // Pending
    status = 'Pending'
  } else if((primaryApproval && !secondaryApprovalEmail && !requiresAP)) { // Approved - does not require secondary approval (no AP)
    status = 'Approved'
  } else if((primaryApproval && secondaryApproval && !requiresAP)) { // Approved - with secondary approval (no AP)
    status = 'Approved'
  } else if((primaryApproval && !secondaryApprovalEmail && requiresAP)) { // Approved for AP
    status = 'Approved For AP' 
  } else if((primaryApproval && secondaryApproval && requiresAP)) { // Approved for AP - with secondary approval
    status = 'Approved For AP'
  } else if((primaryApproval && secondaryApprovalEmail && secondaryApproval === null)) { // Pending secondary approval
    status = 'Pending Secondary Approval'
  } else if((primaryApproval === false || secondaryApproval === false)) { // Denied request
    status = 'Denied'
  } 

  return status
}