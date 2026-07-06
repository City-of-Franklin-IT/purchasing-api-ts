'use strict'

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { DelegateInterface, DelegateCreationAttributes, RequestInterface } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Delegate extends Model<DelegateInterface, DelegateCreationAttributes>{
    declare requestId: string
    declare delegateEmail: string | null
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

  Delegate.init({
    requestId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    delegateEmail: {
      type: DataTypes.STRING,
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
    tableName: 'delegate',
    modelName: 'Delegate',
    freezeTableName: true
  })

  return Delegate
}