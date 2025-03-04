"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = require("nodemailer");
exports.default = async (options) => {
    const recipients = Array.isArray(options.email) ? options.email.join('; ') : options.email;
    const transporter = (0, nodemailer_1.createTransport)({
        service: 'smtp',
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        },
        secure: true,
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        }
    });
    const msg = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: recipients,
        subject: options.subject,
        text: options.msg,
    };
    await transporter.sendMail(msg);
};
//# sourceMappingURL=index.js.map