'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Closed extends sequelize_1.Model {
        static associate({ Purchase }) {
            this.belongsTo(Purchase, { foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Closed.init({
        parentId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false
        },
        comments: {
            type: sequelize_1.DataTypes.STRING
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
        tableName: 'closed',
        modelName: 'Closed'
    });
    return Closed;
};
//# sourceMappingURL=Closed.js.map