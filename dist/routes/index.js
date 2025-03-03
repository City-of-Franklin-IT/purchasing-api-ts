"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const approvals_1 = __importDefault(require("./approvals"));
const attachments_1 = __importDefault(require("./attachments"));
const closed_1 = __importDefault(require("./closed"));
const coding_1 = __importDefault(require("./coding"));
const delegates_1 = __importDefault(require("./delegates"));
const opiq_1 = __importDefault(require("./opiq"));
const purchases_1 = __importDefault(require("./purchases"));
const reconciliation_1 = __importDefault(require("./reconciliation"));
const requests_1 = __importDefault(require("./requests"));
exports.default = (app) => {
    const baseURL = `${process.env.BASE_URL}`;
    const setURL = (path, router) => {
        return app.use(`${baseURL}${path}`, router);
    };
    setURL('/approvals', approvals_1.default);
    setURL('/attachments', attachments_1.default);
    setURL('/closed', closed_1.default);
    setURL('/coding', coding_1.default);
    setURL('/delegates', delegates_1.default);
    setURL('/opiq', opiq_1.default);
    setURL('/purchases', purchases_1.default);
    setURL('/reconciliation', reconciliation_1.default);
    setURL('/requests', requests_1.default);
};
//# sourceMappingURL=index.js.map