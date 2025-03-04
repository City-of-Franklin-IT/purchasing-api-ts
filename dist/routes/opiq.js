"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const opiq_1 = require("@controllers/opiq");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .post('/', opiq_1.createOPIQ);
router
    .route('/:uuid')
    .put(opiq_1.updateOPIQ)
    .delete(opiq_1.deleteOPIQ);
exports.default = router;
//# sourceMappingURL=opiq.js.map