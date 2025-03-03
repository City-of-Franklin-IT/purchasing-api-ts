"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requests_1 = require("@controllers/requests");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .get(requests_1.getRequests)
    .post(requests_1.createRequest);
router
    .route('/:uuid')
    .get(requests_1.getRequest)
    .put(requests_1.updateRequest)
    .delete(requests_1.deleteRequest);
exports.default = router;
//# sourceMappingURL=requests.js.map