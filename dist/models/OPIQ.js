'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class OPIQ extends sequelize_1.Model {
        static associate({ Purchase }) {
            this.belongsTo(Purchase, { foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    OPIQ.init({
        parentId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false
        },
        opiqNum: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
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
        tableName: 'opiq',
        modelName: 'OPIQ'
    });
    return OPIQ;
};
//# sourceMappingURL=OPIQ.js.map