"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parksLookup = exports.searchByJobTitle = exports.employeeSearch = exports.adminSearch = void 0;
// Types
const types_1 = require("@models/types");
const adminSearch = async (dept, client) => {
    return new Promise((resolve, reject) => {
        const items = [];
        const options = {
            filter: `(&(memberOf=cn=Dept Purchasing,cn=Users,dc=franklin-gov,dc=com))`,
            scope: 'sub'
        };
        client.search('dc=franklin-gov, dc=com', options, (err, res) => {
            res.on('searchEntry', (entry) => {
                const userAccountControl = entry.attributes.find(attribute => attribute.type === 'userAccountControl')?.values[0];
                const department = entry.attributes.find(attribute => attribute.type === 'department')?.values[0];
                const email = entry.attributes.find(attribubte => attribubte.type === 'mail')?.values[0];
                if (userAccountControl !== '514' && (department?.toLowerCase() === dept.toLowerCase())) { // Push active account to items[]
                    items.push(email);
                }
            });
            res.on('error', async (err) => {
                reject(err);
            });
            res.on('end', (res) => {
                resolve(items);
            });
        });
    }).catch(error => console.log(error));
};
exports.adminSearch = adminSearch;
const employeeSearch = async (property, value, client) => {
    return new Promise((resolve, reject) => {
        const options = {
            filter: `(&(${property}=${value}))`,
            scope: 'sub'
        };
        client.search('dc=franklin-gov, dc=com', options, (err, res) => {
            let item;
            res.on('searchEntry', (entry) => {
                item = entry;
            });
            res.on('error', async (err) => {
                reject(err);
            });
            res.on('end', (res) => {
                resolve(item);
            });
        });
    });
};
exports.employeeSearch = employeeSearch;
const searchByJobTitle = async (jobTitle, department, client) => {
    return new Promise((resolve, reject) => {
        const options = {
            filter: `(&(title=${jobTitle})(department=${department}))`,
            scope: 'sub'
        };
        client.search('dc=franklin-gov, dc=com', options, (err, res) => {
            const items = [];
            res.on('searchEntry', (entry) => {
                const email = entry.attributes.find(attribute => attribute.type === 'mail')?.values[0];
                email && items.push(email);
            });
            res.on('error', async (err) => {
                reject(err);
            });
            res.on('end', (res) => {
                resolve(items);
            });
        });
    });
};
exports.searchByJobTitle = searchByJobTitle;
const parksLookup = async (employee, client) => {
    if (client.connected) {
        const emails = [];
        const result = await (0, exports.employeeSearch)('mail', employee, client);
        if (result) {
            const title = result.attributes.find(attribute => attribute.type === 'title')?.values[0];
            const email = result.attributes.find(attribute => attribute.type === 'mail')?.values[0];
            let manager = result?.attributes.find(attribute => attribute.type === 'manager')?.values[0];
            if (title && title.split(' ').find(obj => ['Superintendent', 'Director'].includes(obj))) { // Check if user is superintendent or director/assistant director
                emails.push(email);
            }
            else { // If not start check manager loop
                emails.push(email);
                let test = true;
                while (test) { // Bubble up AD until reaching a superintendent
                    const result = await checkManager(manager, client, emails);
                    if (result) {
                        manager = result;
                    }
                    else
                        test = false;
                }
            }
        }
        const admins = await (0, exports.adminSearch)(types_1.DepartmentEnum.PARKS, client); // Get admins from 
        if (admins.length) {
            emails.push(...admins);
        }
        const inventorySpecialist = await (0, exports.searchByJobTitle)('Inventory Specialist', types_1.DepartmentEnum.PARKS, client);
        if (inventorySpecialist.length) {
            emails.push(inventorySpecialist[0]);
        }
        client.unbind();
        return new Array(...new Set(emails));
    }
    else
        return false;
};
exports.parksLookup = parksLookup;
const checkManager = async (manager, client, emails) => {
    const result = await (0, exports.employeeSearch)('distinguishedName', manager, client);
    if (result) {
        const title = result.attributes.find(attribute => attribute.type === 'title')?.values[0];
        const email = result.attributes.find(attribute => attribute.type === 'mail')?.values[0];
        const manager = result.attributes.find(attribute => attribute.type === 'manager')?.values[0];
        if (title?.split(' ').find(obj => ['Superintendent', 'Director'].includes(obj))) { // Target Superintendent
            emails.push(email);
            return null;
        }
        else { // If not superintendent - return data.manager to re-start search
            emails.push(email);
            return manager;
        }
    }
    return result;
};
//# sourceMappingURL=index.js.map