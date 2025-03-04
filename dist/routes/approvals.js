"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const approvals_1 = require("@controllers/approvals");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/:uuid')
    .put(approvals_1.updateApproval);
exports.default = router;
//# sourceMappingURL=approvals.js.map