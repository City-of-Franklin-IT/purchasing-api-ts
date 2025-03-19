"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorResponse_1 = require("@utils/errorResponse");
const index_1 = require("@models/index");
const types_1 = require("@models/types");
exports.default = async (uuid, next) => {
    const purchase = await index_1.Purchase.findOne({
        where: {
            uuid
        },
        include: [
            { model: index_1.Reconciliation },
            { model: index_1.Closed }
        ]
    });
    const newStatus = determinePurchaseStatus(purchase);
    const updated = await index_1.Purchase.update({
        status: newStatus
    }, {
        where: {
            uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = updated;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update purchase by uuid ${uuid}`, 500));
    }
    const data = affectedRows[0];
    return data;
};
const determinePurchaseStatus = (purchase) => {
    const { Reconciliation, Closed } = purchase;
    if (Closed) { // Closed
        return types_1.StatusEnum.Closed;
    }
    if (Reconciliation?.reconciled) { // Completed
        return types_1.StatusEnum.Completed;
    }
    return types_1.StatusEnum.Purchased; // Purchased
};
//# sourceMappingURL=index.js.map