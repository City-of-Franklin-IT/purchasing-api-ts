"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const attachments_1 = require("@controllers/attachments");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .post('/', (0, multer_1.default)().single('file'), attachments_1.createAttachment);
router
    .route('/:uuid')
    .get(attachments_1.getAttachment)
    .delete(attachments_1.deleteAttachment);
exports.default = router;
//# sourceMappingURL=attachments.js.map