// Types
import { Optional, Sequelize, VirtualDataType, Model, ModelStatic } from "sequelize"

export interface ApprovalInterface extends BaseInterface {
  requestId: string
  primaryApproval: boolean | null
  primaryApprovalEmail: string | null
  secondaryApproval: boolean | null
  secondaryApprovalEmail: string | null
  requiresAP: boolean
}

export interface ApprovalCreationAttributes extends Optional<ApprovalInterface, 'requiresAP' | 'uuid' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>{}

export interface AttachmentInterface extends BaseInterface {
  parentId: string
  fileType: FileTypeEnum
  data: Blob
}

export interface AttachmentCreationAttributes extends Optional<AttachmentInterface, 'uuid' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>{}

export interface ClosedInterface extends BaseInterface {
  parentId: string
  readonly closed: boolean
  comments: string | null
}

export interface ClosedCreationAttributes extends Optional<ClosedInterface, 'closed' | 'uuid' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>{}

export interface CodingInterface extends BaseInterface {
  parentId: string
  code: string
}

export interface CodingCreationAtttributes extends Optional<CodingInterface, 'uuid' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>{}

export interface DelegateInterface extends BaseInterface {
  requestId: string
  delegateEmail: string | null
}

export interface DelegateCreationAttributes extends Optional<DelegateInterface, 'uuid' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>{}

export interface OPIQInterface extends BaseInterface {
  parentId: string
  opiqNum: string
}

export interface OPIQCreationAttributes extends Optional<OPIQInterface, 'uuid' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>{}

export interface PurchaseInterface extends BaseInterface {
  purchaseId: string | null
  requestId: string | null
  department: string
  purchaseLocation: string
  purchaseDetails: string
  vendor: string
  purchaseAmount: number
  lastFour: string
  status: StatusEnum | null
  order: VirtualDataType<any>
  OPIQ?: OPIQInterface
  Coding?: CodingInterface
  Reconciliation?: ReconciliationInterface
  Closed?: ClosedInterface
}

export interface PurchaseCreationAttributes extends Optional<PurchaseInterface, 'purchaseId' | 'requestId' | 'order' | 'uuid' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>{}

export interface ReconciliationInterface extends BaseInterface {
  parentId: string
  reconciled: boolean
}

export interface ReconciliationCreationAttributes extends Optional<ReconciliationInterface, 'reconciled' |'uuid' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>{}

export interface RequestInterface extends BaseInterface {
  requestId: string
  department: string
  requestLocation: string
  requestDetails: string
  vendor: string
  requestAmount: number
  weblink: string | null
  status: StatusEnum
  order: VirtualDataType<any>
  Approval?: ApprovalInterface
  Purchase?: PurchaseInterface
  Attachment?: AttachmentInterface
  Delegate?: DelegateInterface
}

export interface RequestCreationAttributes extends Optional<RequestInterface, 'requestId' | 'status' | 'order' | 'uuid' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>{}

export interface FileInterface extends File { // For attachments
  mimetype: string
  buffer: Buffer
}

export enum FileTypeEnum {
  pdf = 'pdf',
  jpeg = 'jpeg'
}

export enum DepartmentEnum {
  IT = 'IT',
  PARKS = 'PARKS',
  FIRE = 'FIRE',
  PD = 'POLICE'
}

export enum StatusEnum {
  Purchased = 'Purchased',
  Pending = 'Pending',
  PendingSecondaryApproval = 'Pending Secondary Approval',
  Approved = 'Approved',
  ApprovedForAP = 'Approved For AP',
  Completed = 'Completed',
  Closed = 'Closed',
  Denied = 'Denied'
}

export interface DatabaseInterface {
  sequelize: Sequelize
  Approval: ModelStatic<Model<ApprovalInterface, ApprovalCreationAttributes>>
  Attachment: ModelStatic<Model<AttachmentInterface, AttachmentCreationAttributes>>
  Closed: ModelStatic<Model<ClosedInterface, ClosedCreationAttributes>>
  Coding: ModelStatic<Model<CodingInterface, CodingCreationAtttributes>>
  Delegate: ModelStatic<Model<DelegateInterface, DelegateCreationAttributes>>
  OPIQ: ModelStatic<Model<OPIQInterface, OPIQCreationAttributes>>
  Purchase: ModelStatic<Model<PurchaseInterface, PurchaseCreationAttributes>>
  Reconciliation: ModelStatic<Model<ReconciliationInterface, ReconciliationCreationAttributes>>
  Request: ModelStatic<Model<RequestInterface, RequestCreationAttributes>>
  [key: string]: ModelStatic<Model<any, any>> | Sequelize
}

export interface ModelWithAssociate extends ModelStatic<Model> {
  associate: (db: DatabaseInterface) => void
}

export interface ConfigInterface {
  [key: string]: any
}

export interface DBPathInterface {
  host: string
  database: string
  username: string
  password: string
  dbPath: string
}

interface BaseInterface {
  uuid: string
  createdBy: string
  createdAt: Date
  updatedBy: string
  updatedAt: Date
}
