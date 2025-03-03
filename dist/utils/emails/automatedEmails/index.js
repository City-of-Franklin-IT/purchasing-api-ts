"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendStatusEmail = exports.sendPurchaseEmail = exports.sendPendingApprovalEmail = void 0;
const sendEmail_1 = __importDefault(require("../sendEmail"));
const sendPendingApprovalEmail = async (email, request) => {
    if (process.env.NODE_ENV !== 'production')
        return null;
    const msg = `There is a purchasing request pending your approval.\n\nRequest ${request.requestId} - "${request.requestDetails}" submitted by ${request.createdBy}.\n\nPlease visit ${process.env.APP_URL}/${request.department.toLowerCase()}/request/${request.uuid} to complete the approval process.`;
    await (0, sendEmail_1.default)({
        email,
        subject: "Purchasing request pending approval",
        msg
    });
};
exports.sendPendingApprovalEmail = sendPendingApprovalEmail;
const sendPurchaseEmail = async (email, purchase) => {
    if (process.env.NODE_ENV !== 'production')
        return null;
    const msg = `A purchase has been submitted by ${purchase.createdBy}.\n\nPlease visit ${process.env.APP_URL}/${purchase.department.toLowerCase()}/purchase/${purchase.uuid} to view details or take further action.`;
    await (0, sendEmail_1.default)({
        email,
        subject: "New purchasing submission",
        msg
    });
};
exports.sendPurchaseEmail = sendPurchaseEmail;
const sendStatusEmail = async (request) => {
    if (process.env.NODE_ENV !== 'production')
        return null;
    let msg;
    const status = request.status;
    const delegateEmail = request.Delegate?.delegateEmail;
    switch (status) { // Set msg
        case 'Approved':
            msg = `Request ${request.requestId} - "${request.requestDetails}" status has changed to "${request.status}".\n\nPlease visit ${process.env.APP_URL}/${request.department.toLowerCase()}/request/${request.uuid} to submit purchase.`;
            break;
        case 'Approved For AP':
            msg = `Request ${request.requestId} - "${request.requestDetails}" status has changed to "${request.status}".\n\nPurchase will be completed by Finance Department - no additional actions are currently necessary.`;
            break;
        default:
            msg = `Request ${request.requestId} - "${request.requestDetails}" status has changed to "${request.status}\n\nTo view request details please visit ${process.env.APP_URL}/${request.department.toLowerCase()}/request/${request.uuid}`;
    }
    if (delegateEmail) { // Delegated for purchase
        await (0, sendEmail_1.default)({
            email: delegateEmail,
            subject: `Purchasing request ${request.requestId} has been delegated to you for completion.`,
            msg
        });
    }
    else {
        await (0, sendEmail_1.default)({
            email: request.createdBy,
            subject: `There has been an update to purchasing request ${request.requestId} - "${request.requestDetails}".`,
            msg
        });
    }
};
exports.sendStatusEmail = sendStatusEmail;
//# sourceMappingURL=index.js.map