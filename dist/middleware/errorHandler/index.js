"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorResponse_1 = require("../../utils/errorResponse");
exports.default = (err, req, res, next) => {
    let error = { ...err };
    if (err.name === 'SequelizeValidationError') {
        const validationError = err;
        error.message = validationError.errors[0].message;
        error = new errorResponse_1.ErrorResponse(error.message, 500);
    }
    else {
        error = new errorResponse_1.ErrorResponse(err.message, 500);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};
//# sourceMappingURL=index.js.map