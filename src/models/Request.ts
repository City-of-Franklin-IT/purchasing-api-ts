'use strict'

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { RequestInterface, RequestCreationAttributes, PurchaseInterface, ApprovalInterface, AttachmentInterface, DelegateInterface, StatusEnum } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Request extends Model<RequestInterface, RequestCreationAttributes> {
    declare requestId: string
    declare department: string
    declare requestLocation: string
    declare requestDetails: string
    declare vendor: string
    declare requestAmount: number
    declare weblink: string | null
    declare status: StatusEnum
    declare requiresAP: boolean
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Purchase, Approval, Attachment, Delegate}: { Purchase: ModelStatic<Model<PurchaseInterface>>, Approval: ModelStatic<Model<ApprovalInterface>>, Attachment: ModelStatic<Model<AttachmentInterface>>, Delegate: ModelStatic<Model<DelegateInterface>> }) {
      this.hasOne(Purchase, { sourceKey: 'requestId', foreignKey: 'requestId' })
      this.hasMany(Approval, { sourceKey: 'requestId', foreignKey: 'requestId' })
      this.hasOne(Attachment, { sourceKey: 'uuid', foreignKey: 'parentId' })
      this.hasOne(Delegate, { sourceKey: 'requestId', foreignKey: 'requestId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Request.init({
    requestId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
      values: ['IT', 'PARKS', 'FIRE', 'POLICE']
    },
    requestLocation: {
      type: DataTypes.STRING,
    },
    requestDetails: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vendor: {
      type: DataTypes.STRING
    },
    requestAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    weblink: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM(...Object.values(StatusEnum)),
      defaultValue: StatusEnum.Pending
    },
    requiresAP: {
      type: dataTypes.NUMBER,
      allowNull: true
    },
    order: {
      type: DataTypes.VIRTUAL,
      get() {
        switch(this.status) {
          case StatusEnum.Purchased:
            return 0
          case StatusEnum.Pending:
            return 1
          case StatusEnum.PendingSecondaryApproval:
            return 2
          case StatusEnum.Approved:
            return 3
          case StatusEnum.ApprovedForAP:
            return 4
          case StatusEnum.Completed: 
            return 5
          case StatusEnum.Closed:
            return 6
          case StatusEnum.Denied:
            return 7
          default:
            return null
        }
      }
    },
    uuid: {
      type: dataTypes.UUID,
      allowNull: false,
      defaultValue: dataTypes.UUIDV4
    },
    createdBy: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: dataTypes.DATE,
      allowNull: false
    },
    updatedBy: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    updatedAt: {
      type: dataTypes.DATE,
      allowNull: false
    }
  },{
    sequelize,
    tableName: 'request',
    modelName: 'Request',
    freezeTableName: true
  })

  return Request
}