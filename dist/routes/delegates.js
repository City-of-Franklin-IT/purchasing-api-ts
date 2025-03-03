"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const delegates_1 = require("@controllers/delegates");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .post('/', delegates_1.createDelegate);
router
    .route('/:uuid')
    .put(delegates_1.updateDelegate)
    .delete(delegates_1.deleteDelegate);
exports.default = router;
//# sourceMappingURL=delegates.js.map