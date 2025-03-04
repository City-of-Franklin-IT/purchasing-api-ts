"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePurchase = exports.updatePurchase = exports.createPurchase = exports.getPurchase = exports.getPurchases = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const index_1 = require("@models/index");
const getFiscalYear_1 = __importDefault(require("@utils/getFiscalYear"));
const setPurchaseStatus_1 = __importDefault(require("@utils/status/setPurchaseStatus"));
const ldap_1 = require("@utils/ldap");
const ldapLookups_1 = require("@utils/ldap/ldapLookups");
const automatedEmails_1 = require("@utils/emails/automatedEmails");
const types_1 = require("@models/types");
const setRequestStatus_1 = __importDefault(require("@utils/status/setRequestStatus"));
//@desc    Get purchases
//@route   GET /api/v2/dept-purchasing/purchases?department=
//@access  Private
exports.getPurchases = (0, async_1.default)(async (req, res, next) => {
    const department = req.query.department.toUpperCase();
    const purchases = await index_1.Purchase.findAll({
        where: {
            department: types_1.DepartmentEnum[department],
            requestId: null
        },
        include: [
            { model: index_1.Attachment,
                attributes: ['fileType', 'uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
            },
            { model: index_1.Reconciliation },
            { model: index_1.OPIQ },
            { model: index_1.Coding },
            { model: index_1.Closed }
        ]
    });
    res.status(200).json({
        success: true,
        data: purchases
    });
});
//@desc    Get purchase
//@route   POST /api/v2/dept-purchasing/purchases/:uuid
//@access  Prviate
exports.getPurchase = (0, async_1.default)(async (req, res, next) => {
    const purchase = await index_1.Purchase.findOne({
        where: {
            uuid: req.params.uuid
        },
        include: [
            { model: index_1.Attachment,
                attributes: ['fileType', 'uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
            },
            { model: index_1.Reconciliation },
            { model: index_1.OPIQ },
            { model: index_1.Coding },
            { model: index_1.Closed }
        ]
    });
    if (!purchase) {
        return next(new errorResponse_1.ErrorResponse(`Unable to return purchase by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        data: purchase
    });
});
//@desc    Create purchase
//@route   POST /api/v2/dept-purchasing/purchases
//@access  Private
exports.createPurchase = (0, async_1.default)(async (req, res, next) => {
    const { requestId, department, purchaseLocation, purchaseDetails, vendor, purchaseAmount, lastFour } = req.body;
    const email = req.user?.email;
    const purchase = await index_1.Purchase.create({
        purchaseId: !requestId ? `PUR${(0, getFiscalYear_1.default)()}${department}-${Math.floor(Date.now() / 1000)}` : null,
        requestId,
        department,
        purchaseLocation,
        purchaseDetails,
        vendor,
        purchaseAmount,
        lastFour,
        status: !requestId ? types_1.StatusEnum.Purchased : null,
        createdBy: email,
        updatedBy: email
    });
    if (!purchase) {
        return next(new errorResponse_1.ErrorResponse('Unable to create new purchase', 500));
    }
    let emailBody;
    if (requestId) { // If purchase has associated request - update status of request
        const request = await index_1.Request.findOne({
            where: {
                requestId
            }
        });
        if (!request) {
            return next(new errorResponse_1.ErrorResponse(`Unable to update status for requestId ${requestId}`, 500));
        }
        const updatedRequest = await (0, setRequestStatus_1.default)(request.uuid, next);
        if (!updatedRequest) {
            return next(new errorResponse_1.ErrorResponse(`Unable to update request status by request uuid ${request.uuid}`, 500));
        }
        emailBody = updatedRequest;
    }
    else
        emailBody = purchase;
    if (process.env.NODE_ENV === 'production') { // Automated emails
        const client = await (0, ldap_1.bindServiceAcct)();
        if (department === 'FIRE') { // Fire
            const admins = await (0, ldapLookups_1.adminSearch)(department, client);
            if (admins) {
                (0, automatedEmails_1.sendPurchaseEmail)(admins, emailBody);
            }
        }
        if (department === 'PARKS') { // Parks
            const emails = await (0, ldapLookups_1.parksLookup)(email, client);
            if (emails) {
                (0, automatedEmails_1.sendPurchaseEmail)(emails, emailBody);
            }
        }
    }
    const reconciliation = await index_1.Reconciliation.create({
        parentId: purchase.uuid,
        createdBy: email,
        updatedBy: email
    });
    if (!reconciliation) {
        return next(new errorResponse_1.ErrorResponse("Could not create reconciliation entry for new purchase", 500));
    }
    res.status(201).json({
        success: true,
        msg: 'Purchase Created',
        data: purchase
    });
});
//@desc    Update purchase
//@route   PUT /api/v2/dept-purchasing/purchases/:uuid
//@access  Private
exports.updatePurchase = (0, async_1.default)(async (req, res, next) => {
    const { purchaseLocation, purchaseDetails, vendor, purchaseAmount, lastFour } = req.body;
    const email = req.user?.email;
    const purchase = await index_1.Purchase.update({
        purchaseLocation,
        purchaseDetails,
        vendor,
        purchaseAmount,
        lastFour,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = purchase;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update purchase by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    if (data.requestId) { // If purchase has associated request - update status of request
        const request = await index_1.Request.findOne({
            where: {
                requestId: data.requestId
            }
        });
        if (!request) {
            return next(new errorResponse_1.ErrorResponse(`Unable to update status for requestId ${data.requestId}`, 500));
        }
        await (0, setRequestStatus_1.default)(request.uuid, next);
    }
    else
        (0, setPurchaseStatus_1.default)(data.uuid, next); // Update purchase status
    res.status(200).json({
        success: true,
        msg: 'Purchase Updated',
        data
    });
});
//@desc    Delete purchase
//@route   DELETE /api/v2/dept-purchasing/purchases/:uuid
//@access  Private
exports.deletePurchase = (0, async_1.default)(async (req, res, next) => {
    const purchase = await index_1.Purchase.findOne({
        where: {
            uuid: req.params.uuid
        }
    });
    const result = await index_1.Purchase.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete purchase by uuid ${req.params.uuid}`, 500));
    }
    if (purchase.requestId) { // Update associated request
        const request = await index_1.Request.findOne({
            where: {
                requestId: purchase.requestId
            }
        });
        if (!request) {
            return next(new errorResponse_1.ErrorResponse(`Unable to update status for requestId ${purchase.requestId}`, 500));
        }
        await (0, setRequestStatus_1.default)(request.uuid, next);
    }
    res.status(200).json({
        success: true,
        msg: 'Purchase Deleted'
    });
});
//# sourceMappingURL=purchases.js.map