'use strict'

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { ApprovalInterface, ApprovalCreationAttributes, RequestInterface } from "./types"

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Approval extends Model<ApprovalInterface, ApprovalCreationAttributes> {
    declare requestId: string
    declare primaryApproval: boolean | null
    declare primaryApprovalEmail: string | null
    declare secondaryApproval: boolean | null
    declare secondaryApprovalEmail: string | null
    declare requiresAP: boolean
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Request }: { Request: ModelStatic<Model<RequestInterface>> }) {
      this.belongsTo(Request, { foreignKey: 'requestId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Approval.init({
    requestId: {
      type: dataTypes.STRING,
      allowNull: false
    },
    primaryApproval: {
      type: dataTypes.NUMBER,
      get() {
        const value = this.getDataValue('primaryApproval')
        return value === null ? null : !!value
      }
    },
    primaryApprovalEmail: {
      type: dataTypes.STRING,
    },
    secondaryApproval: {
      type: dataTypes.NUMBER,
      get() {
        const value = this.getDataValue('secondaryApproval')
        return value === null ? null : !!value
      }
    },
    secondaryApprovalEmail: {
      type: dataTypes.STRING
    },
    requiresAP: {
      type: dataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
      get() {
        const value = this.getDataValue('requiresAP')
        return !!value
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
    tableName: 'approvals',
    modelName: 'Approval',
  })

  return Approval
}