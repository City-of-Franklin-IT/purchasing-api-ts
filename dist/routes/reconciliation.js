"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reconciliation_1 = require("@controllers/reconciliation");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .put('/:uuid', reconciliation_1.updateReconciliation);
exports.default = router;
//# sourceMappingURL=reconciliation.js.map