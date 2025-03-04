"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coding_1 = require("@controllers/coding");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(coding_1.createCode);
router
    .route('/:uuid')
    .put(coding_1.updateCode)
    .delete(coding_1.deleteCode);
exports.default = router;
//# sourceMappingURL=coding.js.map