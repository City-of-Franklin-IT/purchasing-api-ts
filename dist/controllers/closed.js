"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClosed = exports.updateClosed = exports.createClosed = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const index_1 = require("@models/index");
const setPurchaseStatus_1 = __importDefault(require("@utils/status/setPurchaseStatus"));
const setRequestStatus_1 = __importDefault(require("@utils/status/setRequestStatus"));
//@desc    Create Closed entry
//@route   POST /api/v2/dept-purchasing/closed
//@access  Private
exports.createClosed = (0, async_1.default)(async (req, res, next) => {
    const { parentId, comments } = req.body;
    const email = req.user?.email;
    const result = await index_1.Closed.create({
        parentId,
        comments,
        createdBy: email,
        updatedBy: email
    });
    if (!result) {
        return next(new errorResponse_1.ErrorResponse('Unable to create new closed purchase entry', 500));
    }
    const purchase = await index_1.Purchase.findOne({
        where: {
            uuid: parentId
        }
    });
    if (purchase.requestId) { // If purchase has associated request - update status of request
        const request = await index_1.Request.findOne({
            where: {
                requestId: purchase.requestId
            }
        });
        await (0, setRequestStatus_1.default)(request.uuid, next); // Update request status
    }
    else
        await (0, setPurchaseStatus_1.default)(purchase.uuid, next); // Update purchase status
    res.status(201).json({
        success: true,
        msg: "Closed"
    });
});
//@desc    Update Closed entry
//@route   PUT /api/v2/dept-purchasing/closed/:uuid
//@access  Private
exports.updateClosed = (0, async_1.default)(async (req, res, next) => {
    const { comments } = req.body;
    const email = req.user?.email;
    const result = await index_1.Closed.update({
        comments,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    const [affectedCount] = result;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update closed entry with uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Updated"
    });
});
//@desc    Delete Closed entry
//@route   DELETE /api/v2/dept-purchasing/closed/:uuid
//@access  Private
exports.deleteClosed = (0, async_1.default)(async (req, res, next) => {
    const closed = await index_1.Closed.findOne({
        where: {
            uuid: req.params.uuid
        }
    });
    if (!closed) {
        return next(new errorResponse_1.ErrorResponse(`Unable to return closed entry by uuid ${req.params.uuid}`, 500));
    }
    const result = await index_1.Closed.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete closed entry by uuid ${req.params.uuid}`, 500));
    }
    const purchase = await index_1.Purchase.findOne({
        where: {
            uuid: closed.parentId
        }
    });
    if (purchase.requestId) { // If purchase has associated request - update status of request
        const request = await index_1.Request.findOne({
            where: {
                requestId: purchase.requestId
            }
        });
        await (0, setRequestStatus_1.default)(request.uuid, next); // Update request status
    }
    else
        await (0, setPurchaseStatus_1.default)(purchase.uuid, next); // Update purchase status
    res.status(200).json({
        success: true,
        msg: "Closed Entry Deleted"
    });
});
//# sourceMappingURL=closed.js.map