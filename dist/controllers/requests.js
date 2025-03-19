"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRequest = exports.updateRequest = exports.createRequest = exports.getRequest = exports.getRequests = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const index_1 = require("@models/index");
const getFiscalYear_1 = __importDefault(require("@utils/getFiscalYear"));
const ldap_1 = require("@utils/ldap");
const setRequestStatus_1 = __importDefault(require("@utils/status/setRequestStatus"));
const ldapLookups_1 = require("@utils/ldap/ldapLookups");
const automatedEmails_1 = require("@utils/emails/automatedEmails");
const types_1 = require("@models/types");
// @desc    Get requests
// @route   GET /api/v2/dept-purchasing/requests?department=
// @access  Private
exports.getRequests = (0, async_1.default)(async (req, res, next) => {
    const department = req.query.department.toUpperCase();
    const requests = await index_1.Request.findAll({
        where: {
            department: types_1.DepartmentEnum[department]
        },
        include: [
            { model: index_1.Purchase,
                include: [
                    { model: index_1.Attachment,
                        attributes: ['fileType', 'uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
                    },
                    { model: index_1.Reconciliation },
                    { model: index_1.OPIQ },
                    { model: index_1.Coding },
                    { model: index_1.Closed }
                ]
            },
            { model: index_1.Approval },
            { model: index_1.Attachment,
                attributes: ['fileType', 'uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
            },
            { model: index_1.Delegate }
        ]
    });
    res.status(200).json({
        success: true,
        data: requests
    });
});
// @desc    Get request
// @route   GET /api/v2/dept-purchasing/requests/request/:uuid
// @access  Private
exports.getRequest = (0, async_1.default)(async (req, res, next) => {
    const request = await index_1.Request.findOne({
        where: {
            uuid: req.params.uuid
        },
        include: [
            { model: index_1.Purchase,
                include: [
                    { model: index_1.Attachment,
                        attributes: ['fileType', 'uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
                    },
                    { model: index_1.Reconciliation },
                    { model: index_1.OPIQ },
                    { model: index_1.Coding },
                    { model: index_1.Closed }
                ]
            },
            { model: index_1.Approval },
            { model: index_1.Attachment,
                attributes: ['fileType', 'uuid', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
            },
            { model: index_1.Delegate }
        ]
    });
    if (!request) {
        return next(new errorResponse_1.ErrorResponse(`Unable to return request by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        data: request
    });
});
// @desc    Create request
// @route   POST /api/v2/dept-purchasing/requests
// @access  Private
exports.createRequest = (0, async_1.default)(async (req, res, next) => {
    const { department, requestLocation, requestDetails, vendor, requestAmount, weblink } = req.body;
    const email = req.user?.email;
    const request = await index_1.Request.create({
        requestId: `REQ${(0, getFiscalYear_1.default)()}${req.user?.department}-${Math.floor(Date.now() / 1000)}`,
        department,
        requestLocation,
        requestDetails,
        vendor,
        requestAmount,
        weblink,
        createdBy: email,
        updatedBy: email
    });
    if (!request) {
        return next(new errorResponse_1.ErrorResponse("Unable to create new request", 500));
    }
    if (process.env.NODE_ENV === 'production') { // Automated emails
        const client = await (0, ldap_1.bindServiceAcct)();
        if (department === 'FIRE') { // Fire
            const admins = await (0, ldapLookups_1.adminSearch)(department, client);
            if (admins) {
                (0, automatedEmails_1.sendPendingApprovalEmail)(admins, request);
            }
        }
        if (department === 'PARKS') { // Parks
            const emails = await (0, ldapLookups_1.parksLookup)(email, client);
            if (emails) {
                (0, automatedEmails_1.sendPendingApprovalEmail)(emails, request);
            }
        }
    }
    const { requestId } = request;
    const approval = await index_1.Approval.create({
        requestId,
        createdBy: email,
        updatedBy: email
    });
    if (!approval) {
        return next(new errorResponse_1.ErrorResponse(`Unable to create approval entry for requestId ${requestId}`, 500));
    }
    res.status(201).json({
        success: true,
        msg: 'Request Created',
        data: request
    });
});
//@desc    Update Request
//@route   PUT /api/v2/dept-purchasing/requests/:uuid
//@access  Private
exports.updateRequest = (0, async_1.default)(async (req, res, next) => {
    const { requestLocation, requestDetails, vendor, requestAmount, weblink, updatedAt } = req.body;
    const email = req.user?.email;
    const request = await index_1.Request.update({
        requestLocation,
        requestDetails,
        vendor,
        requestAmount,
        weblink,
        updatedBy: email,
        updatedAt
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    const [affectedCount] = request;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update request by uuid ${req.params.uuid}`, 500));
    }
    (0, setRequestStatus_1.default)(req.params.uuid, next);
    res.status(200).json({
        success: true,
        msg: 'Request Updated'
    });
});
//@desc    Delete request
//@route   DELETE /api/v2/dept-purchasing/requests/:uuid
//@access  Private
exports.deleteRequest = (0, async_1.default)(async (req, res, next) => {
    const result = await index_1.Request.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete request by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Request Deleted'
    });
});
//# sourceMappingURL=requests.js.map