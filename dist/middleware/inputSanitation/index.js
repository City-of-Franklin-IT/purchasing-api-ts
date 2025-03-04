"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (req, res, next) => {
    const sanitizeObject = (obj) => {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'string') { // String
                    obj[key] = obj[key].trim().replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Basic sanitization
                }
                else if (Array.isArray(obj[key])) { // Arrays
                    obj[key].forEach(item => sanitizeObject(item));
                }
                else if (typeof obj[key] === 'object' && obj[key] !== null) { // Nested objects
                    sanitizeObject(obj[key]);
                }
            }
        }
    };
    // Check if req.body is an array or object and sanitize accordingly
    if (Array.isArray(req.body)) {
        req.body.forEach(item => sanitizeObject(item)); // Sanitize each object in the array
    }
    else if (typeof req.body === 'object' && req.body !== null) {
        sanitizeObject(req.body); // Sanitize the object directly
    }
    next();
};
//# sourceMappingURL=index.js.map