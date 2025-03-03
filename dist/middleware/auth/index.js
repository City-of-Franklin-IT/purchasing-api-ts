"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const async_1 = __importDefault(require("../async"));
const errorResponse_1 = require("../../utils/errorResponse");
exports.protect = (0, async_1.default)(async (req, res, next) => {
    const env = process.env.NODE_ENV;
    if (env === 'development') { // Development
        const today = new Date();
        const user = {
            role: 'Super User',
            department: 'IT',
            email: 'test.o365-3@franklintn.gov',
            iat: Math.floor(today.getTime() / 1000),
            exp: Math.floor(today.getTime() / 1000) + (30 * 24 * 60 * 60)
        };
        req.user = user;
        return next();
    }
    if (env === 'production' && req.headers.cookie) { // Check for cookie
        const response = await fetch(`${process.env.LDAP_URL}/validate`, {
            headers: {
                'Cookie': req.headers.cookie,
                'Referer': req.headers.referer
            }
        });
        const data = await response.json();
        if (data.success) {
            req.user = data.data;
            return next();
        }
        else
            return next(new errorResponse_1.ErrorResponse('Not authorized to access this route', 401));
    }
    if (env === 'production' && !req.headers.cookie) { // No cookie - unauthorized
        return next(new errorResponse_1.ErrorResponse('Not authorized to access this route', 401));
    }
});
//# sourceMappingURL=index.js.map