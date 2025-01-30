'use strict'

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { ReconciliationInterface, ReconciliationCreationAttributes, PurchaseInterface } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Reconciliation extends Model<ReconciliationInterface, ReconciliationCreationAttributes> {
    declare parentId: string
    declare reconciled: boolean
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

  Reconciliation.init({
    parentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    reconciled: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
      get() {
        const value = this.getDataValue('reconciled')
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
    tableName: 'reconciliation',
    modelName: 'Reconciliation'
  })

  return Reconciliation
}