"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOPIQ = exports.updateOPIQ = exports.createOPIQ = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const index_1 = require("@models/index");
//@desc    Create OPIQ entry
//@route   POST /api/v2/dept-purchasing/opiq
//@access  Private
exports.createOPIQ = (0, async_1.default)(async (req, res, next) => {
    const { parentId, opiqNum } = req.body;
    const email = req.user?.email;
    const opiq = await index_1.OPIQ.create({
        parentId,
        opiqNum,
        createdBy: email,
        updatedBy: email
    });
    if (!opiq) {
        return next(new errorResponse_1.ErrorResponse('Unable to create new OPIQ entry', 500));
    }
    res.status(201).json({
        success: true,
        msg: 'OpIQ Entry Created',
        data: opiq
    });
});
//@desc    Update OPIQ entry
//@route   PUT /api/v2/dept-purchasing/opiq/:uuid
//@access  Private
exports.updateOPIQ = (0, async_1.default)(async (req, res, next) => {
    const { opiqNum } = req.body;
    const email = req.user?.email;
    const opiq = await index_1.OPIQ.update({
        opiqNum,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = opiq;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update OPIQ entry by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    res.status(200).json({
        success: true,
        msg: 'OpIQ Updated',
        data
    });
});
//@desc    Delete OPIQ entry
//@route   DELETE /api/v2/dept-purchasing/opiq/:uuid
//@access  Private
exports.deleteOPIQ = (0, async_1.default)(async (req, res, next) => {
    const result = await index_1.OPIQ.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete OPIQ entry by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'OpIQ Deleted'
    });
});
//# sourceMappingURL=opiq.js.map