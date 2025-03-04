"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCode = exports.updateCode = exports.createCode = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const index_1 = require("@models/index");
//@desc    Create Coding entry
//@route   POST /api/v2/dept-purchasing/coding
//@access  Private
exports.createCode = (0, async_1.default)(async (req, res, next) => {
    const { parentId, code } = req.body;
    const email = req.user?.email;
    const result = await index_1.Coding.create({
        parentId,
        code,
        createdBy: email,
        updatedBy: email,
    });
    if (!result) {
        return next(new errorResponse_1.ErrorResponse('Unable to create new coding entry', 500));
    }
    res.status(201).json({
        success: true,
        msg: 'Coding Created',
        data: result
    });
});
//@desc    Update Coding entry
//@route   PUT /api/v2/dept-purchasing/coding/:uuid
//@access  Private
exports.updateCode = (0, async_1.default)(async (req, res, next) => {
    const { code } = req.body;
    const email = req.user?.email;
    const result = await index_1.Coding.update({
        code,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = result;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update code entry by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    res.status(200).json({
        success: true,
        msg: 'Coding Updated',
        data
    });
});
//@desc    Delete Coding entry
//@route   DELETE /api/v2/dept-purchasing/coding/:uuid
//@access  Private
exports.deleteCode = (0, async_1.default)(async (req, res, next) => {
    const result = await index_1.Coding.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete coding entry by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Coding Deleted'
    });
});
//# sourceMappingURL=coding.js.map