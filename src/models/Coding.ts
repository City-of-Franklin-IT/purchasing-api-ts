'use strict'

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { CodingInterface, CodingCreationAtttributes, PurchaseInterface } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Coding extends Model<CodingInterface, CodingCreationAtttributes>{
    declare parentId: string
    declare code: string
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

  Coding.init({
    parentId: {
      type: dataTypes.STRING,
      allowNull: false
    },
    code: {
      type: dataTypes.STRING,
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
  },{
    sequelize,
    tableName: 'coding',
    modelName: 'Coding',
    freezeTableName: true
  })

  return Coding
}