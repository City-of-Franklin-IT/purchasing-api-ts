"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const closed_1 = require("@controllers/closed");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(closed_1.createClosed);
router
    .route('/:uuid')
    .put(closed_1.updateClosed)
    .delete(closed_1.deleteClosed);
exports.default = router;
//# sourceMappingURL=closed.js.map