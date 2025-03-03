'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
const types_1 = require("./types");
exports.default = (sequelize, dataTypes) => {
    class Request extends sequelize_1.Model {
        static associate({ Purchase, Approval, Attachment, Delegate }) {
            this.hasOne(Purchase, { sourceKey: 'requestId', foreignKey: 'requestId' });
            this.hasOne(Approval, { sourceKey: 'requestId', foreignKey: 'requestId' });
            this.hasOne(Attachment, { sourceKey: 'uuid', foreignKey: 'parentId' });
            this.hasOne(Delegate, { sourceKey: 'requestId', foreignKey: 'requestId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Request.init({
        requestId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        department: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            values: ['IT', 'PARKS', 'FIRE']
        },
        requestLocation: {
            type: sequelize_1.DataTypes.STRING,
        },
        requestDetails: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        vendor: {
            type: sequelize_1.DataTypes.STRING
        },
        requestAmount: {
            type: sequelize_1.DataTypes.DECIMAL,
            allowNull: false
        },
        weblink: {
            type: sequelize_1.DataTypes.STRING
        },
        status: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(types_1.StatusEnum)),
            defaultValue: types_1.StatusEnum.Pending
        },
        order: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get() {
                switch (this.status) {
                    case types_1.StatusEnum.Purchased:
                        return 0;
                    case types_1.StatusEnum.Pending:
                        return 1;
                    case types_1.StatusEnum.PendingSecondaryApproval:
                        return 2;
                    case types_1.StatusEnum.Approved:
                        return 3;
                    case types_1.StatusEnum.ApprovedForAP:
                        return 4;
                    case types_1.StatusEnum.Completed:
                        return 5;
                    case types_1.StatusEnum.Closed:
                        return 6;
                    case types_1.StatusEnum.Denied:
                        return 7;
                    default:
                        return null;
                }
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
        tableName: 'requests',
        modelName: 'Request'
    });
    return Request;
};
//# sourceMappingURL=Request.js.map