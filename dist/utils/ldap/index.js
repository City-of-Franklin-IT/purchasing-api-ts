"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindServiceAcct = void 0;
const ldapjs_1 = __importDefault(require("ldapjs"));
const bindServiceAcct = async () => {
    const client = ldapjs_1.default.createClient({
        url: [`${process.env.LDAP_SERVER}`],
        reconnect: true
    });
    return new Promise((resolve, reject) => {
        client.bind(`COF\\${process.env.AD_SERVICE_ACCT}`, `${process.env.AD_SERVICE_ACCT_PW}`, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(client);
            }
        });
    }).catch(error => {
        console.log(error);
    });
};
exports.bindServiceAcct = bindServiceAcct;
//# sourceMappingURL=index.js.map