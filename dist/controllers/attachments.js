"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.createAttachment = exports.getAttachment = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const index_1 = require("@models/index");
const processImage_1 = __importDefault(require("@utils/processImage"));
const processPDF_1 = __importDefault(require("@utils/processPDF"));
const determineFileType_1 = __importDefault(require("@utils/determineFileType"));
//@desc    Get attachment
//@route   GET /api/v2/dept-purchasing/attachments/attachment/:uuid
//@access  Private
exports.getAttachment = (0, async_1.default)(async (req, res, next) => {
    const attachment = await index_1.Attachment.findOne({
        where: {
            uuid: req.params.uuid
        },
    });
    if (!attachment) {
        return next(new errorResponse_1.ErrorResponse(`Unable to download attachment by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Attachment Downloaded',
        data: attachment
    });
});
//@desc    Create attachment
//@route   POST /api/v2/dept-purchasing/attachments
//@access  Private
exports.createAttachment = (0, async_1.default)(async (req, res, next) => {
    try {
        const { file } = req;
        const { parentId } = req.body;
        const email = req.user?.email;
        const fileType = (0, determineFileType_1.default)(file?.buffer);
        if (!fileType) {
            return next(new errorResponse_1.ErrorResponse("Unable to upload file - wrong file type", 500));
        }
        if (fileType.type === 'image') {
            (0, processImage_1.default)(file, parentId, email, next); // Image
        }
        else
            (0, processPDF_1.default)(file, parentId, email, next); // PDF
        res.status(201).json({
            success: true,
            msg: 'File uploaded'
        });
    }
    catch (err) {
        console.log(err);
    }
});
//@desc    Delete attachment
//@route   DELETE /api/v2/dept-purchasing/attachments/attachment/delete/:uuid
//@access  Private
exports.deleteAttachment = (0, async_1.default)(async (req, res, next) => {
    const result = await index_1.Attachment.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete attachment by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Attachment Deleted'
    });
});
//# sourceMappingURL=attachments.js.map