import moment from 'moment'
import dotenv from 'dotenv'
dotenv.config({ path: 'config/config.env' })

import { ModelStatic, Sequelize } from 'sequelize'

// Types
import { DataTypes, Model } from 'sequelize'
import ApprovalModel from './Approval'
import AttachmentModel from './Attachment'
import ClosedModel from './Closed'
import CodingModel from './Coding'
import DelegateModel from './Delegate'
import OPIQModel from './OPIQ'
import PurchaseModel from './Purchase'
import ReconciliationModel from './Reconciliation'
import RequestModel from './Request'
import { ConfigInterface, DBPathInterface } from './types'
import { ApprovalInterface, AttachmentInterface, ClosedInterface, CodingInterface, DelegateInterface, OPIQInterface, PurchaseInterface, ReconciliationInterface, RequestInterface, DatabaseInterface, ModelWithAssociate } from './types'

const env = process.env.NODE_ENV || 'development'

import config from '../config/config'

const cfg = config as ConfigInterface

const db = {
  sequelize: {} as Sequelize,
  Approval: {} as ModelStatic<Model<ApprovalInterface>>,
  Attachment: {} as ModelStatic<Model<AttachmentInterface>>,
  Closed: {} as ModelStatic<Model<ClosedInterface>>,
  Coding: {} as ModelStatic<Model<CodingInterface>>,
  Delegate: {} as ModelStatic<Model<DelegateInterface>>,
  OPIQ: {} as ModelStatic<Model<OPIQInterface>>,
  Purchase: {} as ModelStatic<Model<PurchaseInterface>>,
  Reconciliation: {} as ModelStatic<Model<ReconciliationInterface>>,
  Request: {} as ModelStatic<Model<RequestInterface>>
} as DatabaseInterface

const dbPath: DBPathInterface = cfg[env]

db.sequelize = new Sequelize({ host: dbPath.host, database: dbPath.database, username: dbPath.username, password: dbPath.password, dialect: 'mssql', timezone: '+00:00' })

DataTypes.DATE.prototype._stringify = function _stringify(date: Date) { // Format DATE for MSSQL
  if(!date) return date
  
  const momentDate = moment.isMoment(date) ? date : moment(date)
  
  return momentDate.format('YYYY-MM-DD HH:mm:ss.SSS')
}

db.Approval = ApprovalModel(db.sequelize, DataTypes)
db.Attachment = AttachmentModel(db.sequelize, DataTypes)
db.Closed = ClosedModel(db.sequelize, DataTypes)
db.Coding = CodingModel(db.sequelize, DataTypes)
db.Delegate = DelegateModel(db.sequelize, DataTypes)
db.OPIQ = OPIQModel(db.sequelize, DataTypes)
db.Purchase = PurchaseModel(db.sequelize, DataTypes)
db.Reconciliation = ReconciliationModel(db.sequelize, DataTypes)
db.Request = RequestModel(db.sequelize, DataTypes)

Object.keys(db).forEach(modelName => {
  if((db[modelName] as ModelWithAssociate).associate) {
    (db[modelName] as ModelWithAssociate).associate(db)
  }
})

export const Approval = db.Approval
export const Attachment = db.Attachment
export const Closed = db.Closed
export const Coding = db.Coding
export const Delegate = db.Delegate
export const OPIQ = db.OPIQ
export const Purchase = db.Purchase
export const Reconciliation = db.Reconciliation
export const Request = db.Request