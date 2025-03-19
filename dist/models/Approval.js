'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Approval extends sequelize_1.Model {
        static associate({ Request }) {
            this.belongsTo(Request, { foreignKey: 'requestId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Approval.init({
        requestId: {
            type: dataTypes.STRING,
            allowNull: false
        },
        primaryApproval: {
            type: dataTypes.NUMBER,
            get() {
                const value = this.getDataValue('primaryApproval');
                return value === null ? null : !!value;
            }
        },
        primaryApprovalEmail: {
            type: dataTypes.STRING,
        },
        secondaryApproval: {
            type: dataTypes.NUMBER,
            get() {
                const value = this.getDataValue('secondaryApproval');
                return value === null ? null : !!value;
            }
        },
        secondaryApprovalEmail: {
            type: dataTypes.STRING
        },
        requiresAP: {
            type: dataTypes.NUMBER,
            allowNull: false,
            defaultValue: 0,
            get() {
                const value = this.getDataValue('requiresAP');
                return !!value;
            }
        },
        uuid: {
            type: dataTypes.UUID,
            allowNull: false,
            defaultValue: dataTypes.UUIDV4
        },
        createdBy: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: dataTypes.DATE,
            allowNull: false
        },
        updatedBy: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        updatedAt: {
            type: dataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'approvals',
        modelName: 'Approval',
    });
    return Approval;
};
//# sourceMappingURL=Approval.js.map