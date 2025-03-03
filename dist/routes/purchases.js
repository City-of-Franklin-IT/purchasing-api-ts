"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const purchases_1 = require("@controllers/purchases");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .get(purchases_1.getPurchases)
    .post(purchases_1.createPurchase);
router
    .route('/:uuid')
    .get(purchases_1.getPurchase)
    .put(purchases_1.updatePurchase)
    .delete(purchases_1.deletePurchase);
exports.default = router;
//# sourceMappingURL=purchases.js.map