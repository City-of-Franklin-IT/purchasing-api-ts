"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDelegate = exports.updateDelegate = exports.createDelegate = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const index_1 = require("@models/index");
const automatedEmails_1 = require("@utils/emails/automatedEmails");
//@desc    Create Delegate
//@route   POST /api/v2/dept-purchasing/delegate/create
//@access  Private
exports.createDelegate = (0, async_1.default)(async (req, res, next) => {
    const { requestId } = req.body;
    const email = req.user?.email;
    const delegate = await index_1.Delegate.create({
        requestId,
        createdBy: email,
        updatedBy: email
    });
    if (!delegate) {
        return next(new errorResponse_1.ErrorResponse(`Unable to create delegate entry for request ${requestId}`, 500));
    }
    res.status(201).json({
        success: true,
        data: delegate
    });
});
//@desc    Update Delegate
//@route   PUT /api/v2/dept-purchasing/delegate/update/:uuid  
//@access  Private
exports.updateDelegate = (0, async_1.default)(async (req, res, next) => {
    const { delegateEmail } = req.body;
    const email = req.user?.email;
    const delegate = await index_1.Delegate.update({
        delegateEmail,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = delegate;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update delegate entry by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    const request = await index_1.Request.findOne({
        where: {
            requestId: data.requestId
        },
        include: {
            model: index_1.Delegate
        }
    });
    (0, automatedEmails_1.sendStatusEmail)(request);
    res.status(200).json({
        success: true,
        data
    });
});
//@desc    Delete Delegate
//@route   DELETE /api/v2/dept-purchasing/delegate/delete/:uuid
//@access  Private
exports.deleteDelegate = (0, async_1.default)(async (req, res, next) => {
    const result = await index_1.Delegate.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete delgate entry by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Delete Entry Deleted'
    });
});
//# sourceMappingURL=delegates.js.map