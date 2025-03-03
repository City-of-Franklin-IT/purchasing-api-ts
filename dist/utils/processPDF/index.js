"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorResponse_1 = require("@utils/errorResponse");
const index_1 = require("@models/index");
const types_1 = require("@models/types");
exports.default = async (file, parentId, email, next) => {
    const attachment = await index_1.Attachment.create({
        parentId,
        fileType: types_1.FileTypeEnum.pdf,
        data: file.buffer,
        createdBy: email,
        updatedBy: email
    });
    if (!attachment) {
        return next(new errorResponse_1.ErrorResponse("Unable to upload pdf", 500));
    }
};
//# sourceMappingURL=index.js.map