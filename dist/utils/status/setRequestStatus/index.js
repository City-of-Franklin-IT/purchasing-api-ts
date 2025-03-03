"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorResponse_1 = require("@utils/errorResponse");
const index_1 = require("@models/index");
const types_1 = require("@models/types");
exports.default = async (uuid, next) => {
    const request = await index_1.Request.findOne({
        where: {
            uuid
        },
        include: [
            { model: index_1.Approval },
            { model: index_1.Purchase,
                include: [
                    { model: index_1.Closed },
                    { model: index_1.Reconciliation }
                ]
            }
        ]
    });
    const newStatus = determineRequestStatus(request);
    const updated = await index_1.Request.update({
        status: newStatus
    }, {
        where: {
            uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = updated;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update request by uuid ${uuid}`, 500));
    }
    const data = affectedRows[0];
    return data;
};
const determineRequestStatus = (request) => {
    const { Approval, Purchase } = request;
    if (Purchase) { // Handle requests with associated purchases
        if (Purchase.Closed) {
            return types_1.StatusEnum.Closed;
        }
        if (Purchase.Reconciliation?.reconciled) {
            return types_1.StatusEnum.Completed;
        }
        return types_1.StatusEnum.Purchased;
    }
    else
        return handleRequestApprovalStatus(Approval);
};
const handleRequestApprovalStatus = (Approval) => {
    if (Approval?.primaryApproval === false) { // Denied
        return types_1.StatusEnum.Denied; // Return Denied
    }
    let approvalStatus = types_1.StatusEnum.Pending;
    if (Approval?.primaryApproval) {
        if (Approval?.secondaryApprovalEmail) { // Requires secondary approval
            const secondaryApproval = Approval.secondaryApproval;
            switch (secondaryApproval) {
                case true:
                    approvalStatus = types_1.StatusEnum.Approved;
                case false:
                    approvalStatus = types_1.StatusEnum.Denied;
                default:
                    approvalStatus = types_1.StatusEnum.PendingSecondaryApproval;
            }
        }
        else
            approvalStatus = types_1.StatusEnum.Approved;
        if (approvalStatus === types_1.StatusEnum.Approved) {
            if (Approval.requiresAP) {
                approvalStatus = types_1.StatusEnum.ApprovedForAP;
                return approvalStatus; // Return Approved for AP
            }
            else
                return approvalStatus; // Return Approved
        }
        else
            return approvalStatus; // Return Denied | Pending Secondary Approval
    }
    else
        return approvalStatus; // Return Pending
};
//# sourceMappingURL=index.js.map