"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = exports.Reconciliation = exports.Purchase = exports.OPIQ = exports.Delegate = exports.Coding = exports.Closed = exports.Attachment = exports.Approval = void 0;
const moment_1 = __importDefault(require("moment"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: 'config/config.env' });
const sequelize_1 = require("sequelize");
// Types
const sequelize_2 = require("sequelize");
const Approval_1 = __importDefault(require("./Approval"));
const Attachment_1 = __importDefault(require("./Attachment"));
const Closed_1 = __importDefault(require("./Closed"));
const Coding_1 = __importDefault(require("./Coding"));
const Delegate_1 = __importDefault(require("./Delegate"));
const OPIQ_1 = __importDefault(require("./OPIQ"));
const Purchase_1 = __importDefault(require("./Purchase"));
const Reconciliation_1 = __importDefault(require("./Reconciliation"));
const Request_1 = __importDefault(require("./Request"));
const env = process.env.NODE_ENV || 'development';
const config_1 = __importDefault(require("../config/config"));
const cfg = config_1.default;
const db = {
    sequelize: {},
    Approval: {},
    Attachment: {},
    Closed: {},
    Coding: {},
    Delegate: {},
    OPIQ: {},
    Purchase: {},
    Reconciliation: {},
    Request: {}
};
const dbPath = cfg[env];
db.sequelize = new sequelize_1.Sequelize({ host: dbPath.host, database: dbPath.database, username: dbPath.username, password: dbPath.password, dialect: 'mssql', timezone: '+00:00', logging: false });
sequelize_2.DataTypes.DATE.prototype._stringify = function _stringify(date) {
    if (!date)
        return date;
    const momentDate = moment_1.default.isMoment(date) ? date : (0, moment_1.default)(date);
    return momentDate.format('YYYY-MM-DD HH:mm:ss.SSS');
};
db.Approval = (0, Approval_1.default)(db.sequelize, sequelize_2.DataTypes);
db.Attachment = (0, Attachment_1.default)(db.sequelize, sequelize_2.DataTypes);
db.Closed = (0, Closed_1.default)(db.sequelize, sequelize_2.DataTypes);
db.Coding = (0, Coding_1.default)(db.sequelize, sequelize_2.DataTypes);
db.Delegate = (0, Delegate_1.default)(db.sequelize, sequelize_2.DataTypes);
db.OPIQ = (0, OPIQ_1.default)(db.sequelize, sequelize_2.DataTypes);
db.Purchase = (0, Purchase_1.default)(db.sequelize, sequelize_2.DataTypes);
db.Reconciliation = (0, Reconciliation_1.default)(db.sequelize, sequelize_2.DataTypes);
db.Request = (0, Request_1.default)(db.sequelize, sequelize_2.DataTypes);
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
exports.Approval = db.Approval;
exports.Attachment = db.Attachment;
exports.Closed = db.Closed;
exports.Coding = db.Coding;
exports.Delegate = db.Delegate;
exports.OPIQ = db.OPIQ;
exports.Purchase = db.Purchase;
exports.Reconciliation = db.Reconciliation;
exports.Request = db.Request;
//# sourceMappingURL=index.js.map