'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Delegate extends sequelize_1.Model {
        static associate({ Request }) {
            this.belongsTo(Request, { foreignKey: 'requestId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Delegate.init({
        requestId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        delegateEmail: {
            type: sequelize_1.DataTypes.STRING,
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
        tableName: 'delegates',
        modelName: 'Delegate'
    });
    return Delegate;
};
//# sourceMappingURL=Delegate.js.map