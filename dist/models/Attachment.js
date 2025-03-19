'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
const types_1 = require("./types");
exports.default = (sequelize, dataTypes) => {
    class Attachment extends sequelize_1.Model {
        static associate({ Request, Purchase }) {
            this.belongsTo(Request, { foreignKey: 'parentId', targetKey: 'uuid' });
            this.belongsTo(Purchase, { foreignKey: 'parentId', targetKey: 'uuid' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Attachment.init({
        parentId: {
            type: dataTypes.UUID,
            allowNull: false
        },
        fileType: {
            type: dataTypes.ENUM(...Object.values(types_1.FileTypeEnum)),
            allowNull: false
        },
        data: {
            type: dataTypes.BLOB,
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
        tableName: 'attachments',
        modelName: 'Attachment'
    });
    return Attachment;
};
//# sourceMappingURL=Attachment.js.map