import sendEmail from "../sendEmail"

// Types
import { PurchaseInterface, RequestInterface } from "@models/types"

export const sendPendingApprovalEmail = async (email: string[], request: RequestInterface) => { // New request - pending approval
  if(process.env.NODE_ENV !== 'production') return null

  const msg = `There is a purchasing request pending your approval.\n\nRequest ${ request.requestId } - "${ request.requestDetails }" submitted by ${ request.createdBy }.\n\nPlease visit ${ process.env.APP_URL }/${ request.department.toLowerCase() }/request/${ request.uuid } to complete the approval process.`

  await sendEmail({
    email,
    subject: "Purchasing request pending approval",
    msg
  })
}

export const sendPurchaseEmail = async (email: string[], purchase: PurchaseInterface) => { // New purchase - no associated request
  if(process.env.NODE_ENV !== 'production') return null

  const msg = `A purchase has been submitted by ${ purchase.createdBy }.\n\nPlease visit ${ process.env.APP_URL }/${ purchase.department.toLowerCase() }/purchase/${ purchase.uuid } to view details or take further action.`

  await sendEmail({
    email,
    subject: "New purchasing submission",
    msg
  })
}

export const sendStatusEmail = async (request: RequestInterface) => { // Send email on request status change
  if(process.env.NODE_ENV !== 'production') return null
  
  let msg

  const status = request.status
  const delegateEmail = request.Delegate?.delegateEmail

  switch(status) { // Set msg
    case 'Approved':
      msg = `Request ${ request.requestId } - "${ request.requestDetails }" status has changed to "${ request.status }".\n\nPlease visit ${ process.env.APP_URL }/${ request.department.toLowerCase() }/request/${ request.uuid } to submit purchase.`
      break
    case 'Approved For AP':
      msg = `Request ${ request.requestId } - "${ request.requestDetails }" status has changed to "${ request.status }".\n\nPurchase will be completed by Finance Department - no additional actions are currently necessary.`
      break
    default:
      msg = `Request ${ request.requestId } - "${ request.requestDetails }" status has changed to "${ request.status }\n\nTo view request details please visit ${ process.env.APP_URL }/${ request.department.toLowerCase() }/request/${ request.uuid }`
  }

  if(delegateEmail) { // Delegated for purchase
    await sendEmail({
      email: delegateEmail,
      subject: `Purchasing request ${ request.requestId } has been delegated to you for completion.`,
      msg
    }) 
  } else {
    await sendEmail({
      email: request.createdBy,
      subject: `There has been an update to purchasing request ${ request.requestId } - "${ request.requestDetails }".`,
      msg
    })
  }
}