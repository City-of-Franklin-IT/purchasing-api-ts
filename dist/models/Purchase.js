'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
const types_1 = require("./types");
exports.default = (sequelize, dataTypes) => {
    class Purchase extends sequelize_1.Model {
        static associate({ Attachment, Reconciliation, OPIQ, Coding, Closed }) {
            this.hasOne(Attachment, { sourceKey: 'uuid', foreignKey: 'parentId' });
            this.hasOne(Reconciliation, { sourceKey: 'uuid', foreignKey: 'parentId' });
            this.hasOne(OPIQ, { sourceKey: 'uuid', foreignKey: 'parentId' });
            this.hasOne(Coding, { sourceKey: 'uuid', foreignKey: 'parentId' });
            this.hasOne(Closed, { sourceKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Purchase.init({
        purchaseId: {
            type: sequelize_1.DataTypes.STRING
        },
        requestId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        department: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(types_1.DepartmentEnum))
        },
        purchaseLocation: {
            type: sequelize_1.DataTypes.STRING
        },
        purchaseDetails: {
            type: sequelize_1.DataTypes.STRING
        },
        vendor: {
            type: sequelize_1.DataTypes.STRING
        },
        purchaseAmount: {
            type: sequelize_1.DataTypes.DECIMAL
        },
        lastFour: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(types_1.StatusEnum))
        },
        order: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get() {
                switch (this.status) {
                    case types_1.StatusEnum.Purchased:
                        return 0;
                    case types_1.StatusEnum.Completed:
                        return 5;
                    case types_1.StatusEnum.Closed:
                        return 6;
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
        tableName: 'purchases',
        modelName: 'Purchase'
    });
    return Purchase;
};
//# sourceMappingURL=Purchase.js.map