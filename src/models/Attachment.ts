'use strict'

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { AttachmentInterface, AttachmentCreationAttributes, RequestInterface, PurchaseInterface } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Attachment extends Model<AttachmentInterface, AttachmentCreationAttributes> {
    declare parentId: string
    declare data: Blob
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Request, Purchase }: { Request: ModelStatic<Model<RequestInterface>>, Purchase: ModelStatic<Model<PurchaseInterface>> }) {
      this.belongsTo(Request, { foreignKey: 'parentId', targetKey: 'uuid' })
      this.belongsTo(Purchase, { foreignKey: 'parentId', targetKey: 'uuid' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Attachment.init({
    parentId: {
      type: dataTypes.UUID,
      allowNull: false
    },
    data: {
      type: dataTypes.BLOB,
      allowNull: false
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
  }, {
      sequelize,
      tableName: 'attachment',
      modelName: 'Attachment',
      freezeTableName: true
    })

    return Attachment
}