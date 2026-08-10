'use strict'

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { PurchaseInterface, PurchaseCreationAttributes, AttachmentInterface, OPIQInterface, CodingInterface, ClosedInterface, ReconciliationInterface, EmergencyPurchaseInterface, StatusEnum } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Purchase extends Model<PurchaseInterface, PurchaseCreationAttributes> {
    declare purchaseId: string | null
    declare requestId: string | null
    declare department: string
    declare purchaseLocation: string
    declare purchaseDetails: string
    declare vendor: string
    declare purchaseAmount: number
    declare lastFour: string
    declare status: StatusEnum | null
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Attachment, Reconciliation, OPIQ, Coding, Closed, EmergencyPurchase }: { Attachment: ModelStatic<Model<AttachmentInterface>>, Reconciliation: ModelStatic<Model<ReconciliationInterface>>, OPIQ: ModelStatic<Model<OPIQInterface>>, Coding: ModelStatic<Model<CodingInterface>>, Closed: ModelStatic<Model<ClosedInterface>>, EmergencyPurchase: ModelStatic<Model<EmergencyPurchaseInterface>> }) {
      this.hasOne(Attachment, { sourceKey: 'uuid', foreignKey: 'parentId' })
      this.hasOne(Reconciliation, { sourceKey: 'uuid', foreignKey: 'parentId' })
      this.hasOne(OPIQ, { sourceKey: 'uuid', foreignKey: 'parentId' })
      this.hasOne(Coding, { sourceKey: 'uuid', foreignKey: 'parentId' })
      this.hasOne(Closed, { sourceKey: 'uuid', foreignKey: 'parentId' })
      this.hasOne(EmergencyPurchase, { sourceKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Purchase.init({
    purchaseId: {
      type: DataTypes.STRING
    },
    requestId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    department: {
      type: DataTypes.STRING
    },
    purchaseLocation: {
      type: DataTypes.STRING
    },
    purchaseDetails: {
      type: DataTypes.STRING
    },
    vendor: {
      type: DataTypes.STRING
    },
    purchaseAmount: {
      type: DataTypes.DECIMAL
    },
    lastFour: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(...Object.values(StatusEnum))
    },
    order: {
      type: DataTypes.VIRTUAL,
      get() {
        switch(this.status) {
          case StatusEnum.Purchased:
            return 0
          case StatusEnum.Completed: 
            return 5
          case StatusEnum.Closed:
            return 6
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
    tableName: 'purchase',
    modelName: 'Purchase',
    freezeTableName: true
  })

  return Purchase
}