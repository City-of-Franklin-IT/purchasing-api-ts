// Types
import { Model } from "sequelize"
import { ApprovalInterface, AttachmentInterface, CodingInterface, DelegateInterface, OPIQInterface, PurchaseInterface, ReconciliationInterface, RequestInterface, StatusEnum } from "@models/types"

export interface CreateApprovalRequest {
  requestId: string
  approverEmail: string
  isFinal: boolean | null
}

export interface UpdateApprovalRequest {
  approval: boolean | null
  isFinal: boolean | null
}

export interface UpdateApprovalResponse extends ControllerResponse {
  data: Model<ApprovalInterface> & ApprovalInterface
}

export interface GetAttachmentResponse extends ControllerResponse {
  data: {
    attachment: (Model<AttachmentInterface> & AttachmentInterface)
    type: string
  }
}

export interface CreateAttachmentRequest {
  parentId: string
}

export interface CreateClosedRequest {
  parentId: string
  comments: string | null
}

export interface UpdateClosedRequest {
  comments: string | null
}

export interface CreateCodingRequest {
  parentId: string
  code: string
}

export interface CreateCodingResponse extends ControllerResponse {
  data: Model<CodingInterface> & CodingInterface
}

export interface UpdateCodingRequest {
  code: string
}

export interface UpdateCodingResponse extends ControllerResponse {
  data: Model<CodingInterface> & CodingInterface
}

export interface CreateDelegateRequest {
  requestId: string
}

export interface CreateDelegateResponse {
  success: boolean
  data: Model<DelegateInterface> & DelegateInterface
}

export interface UpdateDelegateRequest {
  delegateEmail: string
}

export interface UpdateDelegateResponse {
  success: true
  data: Model<DelegateInterface> & DelegateInterface
}

export interface CreateOPIQRequest {
  parentId: string
  opiqNum: string
}

export interface CreateOPIQResponse extends ControllerResponse{
  data: Model<OPIQInterface> & OPIQInterface
}

export interface UpdateOPIQRequest {
  opiqNum: string
}

export interface UpdateOPIQResponse extends ControllerResponse {
  data: Model<OPIQInterface> & OPIQInterface
}

export interface GetPurchasesResponse {
  success: boolean
  data: (Model<PurchaseInterface> & PurchaseInterface)[]
}

export interface GetPurchaseResponse {
  success: boolean
  data: Model<PurchaseInterface> & PurchaseInterface
}

export interface CreatePurchaseRequest {
  purchaseId: string| null
  requestId: string | null
  department: string
  purchaseLocation: string
  purchaseDetails: string
  vendor: string
  purchaseAmount: number
  lastFour: string
  status: StatusEnum | null
}

export interface CreatePurchaseResponse extends ControllerResponse {
  data: Model<PurchaseInterface> & PurchaseInterface | undefined
}

export interface UpdatePurchaseRequest {
  purchaseLocation: string
  purchaseDetails: string
  vendor: string
  purchaseAmount: number
  lastFour: string
  status: StatusEnum | null
}

export interface UpdatePurchaseResponse extends ControllerResponse {
  data: Model<PurchaseInterface> & PurchaseInterface
}

export interface CreateReconciliationRequest {
  parentId: string
}

export interface CreateReconciliationResponse extends ControllerResponse {
  data: Model<ReconciliationInterface> & ReconciliationInterface
}

export interface GetRequestsResponse {
  success: boolean
  data: (Model<RequestInterface> & RequestInterface)[]
}

export interface GetRequestResponse {
  success: boolean
  data: Model<RequestInterface> & RequestInterface
}

export interface CreateRequestRequest {
  department: string
  requestLocation: string
  requestDetails: string
  vendor: string
  requestAmount: number
  weblink: string | null
}

export interface CreateRequestResponse extends ControllerResponse {
  data: Model<RequestInterface> & RequestInterface
}

export interface UpdateRequestRequest {
  requestLocation: string
  requestDetails: string
  vendor: string
  requestAmount: number
  weblink: string | null
}

export interface ControllerResponse {
  success: boolean
  msg?: string
}