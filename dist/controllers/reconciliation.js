"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReconciliation = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const index_1 = require("@models/index");
const setRequestStatus_1 = __importDefault(require("@utils/status/setRequestStatus"));
const setPurchaseStatus_1 = __importDefault(require("@utils/status/setPurchaseStatus"));
//@desc    Update reconciliation
//@route   PUT /api/v2/dept-purchasing/reconciliation/entry/update/:uuid
//@access  Private
exports.updateReconciliation = (0, async_1.default)(async (req, res, next) => {
    const { reconciled } = req.body;
    const email = req.user?.email;
    const reconciliation = await index_1.Reconciliation.update({
        reconciled,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = reconciliation;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update reconciliation entry by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    const purchase = await index_1.Purchase.findOne({
        where: {
            uuid: data.parentId
        }
    });
    if (!purchase) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update purchase status by uuid ${data.parentId}`, 500));
    }
    if (purchase.requestId) { // If associated to a request
        const request = await index_1.Request.findOne({
            where: {
                requestId: purchase.requestId
            }
        });
        if (!request) {
            return next(new errorResponse_1.ErrorResponse(`Unable to update request status by requestId ${purchase.requestId}`, 500));
        }
        await (0, setRequestStatus_1.default)(request.uuid, next); // Update request status
    }
    else
        await (0, setPurchaseStatus_1.default)(purchase.uuid, next); // Update purchase status
    res.status(200).json({
        success: true,
        msg: 'Reconciliation Updated',
        data
    });
});
//# sourceMappingURL=reconciliation.js.map