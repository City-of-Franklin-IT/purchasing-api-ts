'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Reconciliation extends sequelize_1.Model {
        static associate({ Purchase }) {
            this.belongsTo(Purchase, { foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Reconciliation.init({
        parentId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false
        },
        reconciled: {
            type: sequelize_1.DataTypes.NUMBER,
            allowNull: false,
            defaultValue: 0,
            get() {
                const value = this.getDataValue('reconciled');
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
        tableName: 'reconciliation',
        modelName: 'Reconciliation'
    });
    return Reconciliation;
};
//# sourceMappingURL=Reconciliation.js.map