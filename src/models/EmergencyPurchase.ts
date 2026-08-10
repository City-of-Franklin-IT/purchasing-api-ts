'use strict'

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { EmergencyPurchaseInterface, EmergencyPurchaseCreationAttributes, PurchaseInterface } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class EmergencyPurchase extends Model<EmergencyPurchaseInterface, EmergencyPurchaseCreationAttributes> {
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

  EmergencyPurchase.init({
    parentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    comments: {
      type: DataTypes.STRING,
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
    tableName: 'emergency',
    modelName: 'EmergencyPurchase',
    freezeTableName: true
  })

  return EmergencyPurchase
}
