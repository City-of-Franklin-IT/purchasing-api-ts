'use strict'

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { ApprovalInterface, ApprovalCreationAttributes, RequestInterface } from "./types"

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Approval extends Model<ApprovalInterface, ApprovalCreationAttributes> {
    declare requestId: string
    declare approverEmail: string
    declare approval: boolean | null
    declare isFinal: boolean | null
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
    approverEmail: {
      type: dataTypes.STRING,
      allowNull: false
    },
    approval: {
      type: dataTypes.NUMBER,
      get() {
        const value = this.getDataValue('approval')
        return value === null ? null : !!value
      }
    },
    isFinal: {
      type: dataTypes.NUMBER,
      get() {
        const value = this.getDataValue('isFinal')
        return value === null ? null : !!value
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
    tableName: 'approval',
    modelName: 'Approval',
    freezeTableName: true
  })

  return Approval
}