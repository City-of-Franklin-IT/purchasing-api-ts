'use strict'

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { OPIQInterface, OPIQCreationAttributes, PurchaseInterface } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class OPIQ extends Model<OPIQInterface, OPIQCreationAttributes>{
    declare parentId: string
    declare opiqNum: string
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

  OPIQ.init({
    parentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    opiqNum: {
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
    tableName: 'opiq',
    modelName: 'OPIQ',
    freezeTableName: true
  })

  return OPIQ
}