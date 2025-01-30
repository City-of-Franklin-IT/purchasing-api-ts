'use strict'

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { ClosedInterface, ClosedCreationAttributes, PurchaseInterface } from "./types"

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Closed extends Model<ClosedInterface, ClosedCreationAttributes> {
    declare parentId: string
    declare comments: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Purchase }: { Purchase: ModelStatic<Model<PurchaseInterface>> }) {
      this.belongsTo(Purchase, { foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Closed.init({
    parentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    comments: {
      type: DataTypes.STRING
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
    tableName: 'closed',
    modelName: 'Closed'
  })

  return Closed
}