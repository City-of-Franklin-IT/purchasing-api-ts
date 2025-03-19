"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (buffer) => {
    // Check if buffer is valid
    if (!Buffer.isBuffer(buffer) || buffer.length < 8) {
        throw new Error('Invalid file buffer');
    }
    if (matchesSignature(buffer, fileSignatures.JPEG)) {
        return { type: 'image', subtype: 'jpeg', mimeType: 'image/jpeg' };
    }
    if (matchesSignature(buffer, fileSignatures.PNG)) {
        return { type: 'image', subtype: 'png', mimeType: 'image/png' };
    }
    if (matchesSignature(buffer, fileSignatures.GIF)) {
        return { type: 'image', subtype: 'gif', mimeType: 'image/gif' };
    }
    if (matchesSignature(buffer, fileSignatures.PDF)) {
        return { type: 'pdf', subtype: 'pdf', mimeType: 'application/pdf' };
    }
    return { type: 'unknown', mimeType: 'application/octet-stream' };
};
const matchesSignature = (buffer, signatures) => {
    return signatures.some(signature => {
        return signature.every((byte, index) => buffer[index] === byte);
    });
};
const fileSignatures = {
    JPEG: [[0xFF, 0xD8, 0xFF]], // JPEG
    PNG: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG
    GIF: [
        [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
        [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] // GIF89a
    ],
    PDF: [[0x25, 0x50, 0x44, 0x46]] // %PDF
};
//# sourceMappingURL=index.js.map