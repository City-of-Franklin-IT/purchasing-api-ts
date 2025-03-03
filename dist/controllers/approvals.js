"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApproval = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const setRequestStatus_1 = __importDefault(require("@utils/status/setRequestStatus"));
const index_1 = require("@models/index");
const automatedEmails_1 = require("@utils/emails/automatedEmails");
//@desc    Update request approval
//@route   PUT /api/v2/dept-purchasing/approvals/approval/update/:uuid
//@access  Private
exports.updateApproval = (0, async_1.default)(async (req, res, next) => {
    const { primaryApproval, primaryApprovalEmail, secondaryApproval, secondaryApprovalEmail, requiresAP } = req.body;
    const email = req.user?.email;
    const approval = await index_1.Approval.update({
        primaryApproval,
        primaryApprovalEmail,
        secondaryApproval,
        secondaryApprovalEmail,
        requiresAP,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = approval;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update request approval by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    const request = await index_1.Request.findOne({
        where: {
            requestId: data.requestId
        }
    });
    const updatedRequest = await (0, setRequestStatus_1.default)(request.uuid, next); // Update request status
    if (!updatedRequest) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update request status by request uuid ${request.uuid}`, 500));
    }
    if (updatedRequest.status === 'Pending Secondary Approval' && secondaryApprovalEmail) {
        (0, automatedEmails_1.sendPendingApprovalEmail)([secondaryApprovalEmail], updatedRequest);
    }
    (0, automatedEmails_1.sendStatusEmail)(updatedRequest);
    res.status(200).json({
        success: true,
        msg: 'Approval Updated',
        data
    });
});
//# sourceMappingURL=approvals.js.map