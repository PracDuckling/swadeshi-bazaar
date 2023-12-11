const { DataTypes } = require("sequelize");

const lineItemModel = (sequelize) => {
    return sequelize.define("lineItem", {
        line_item_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            constraints: { unique: true },
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "products",
                key: "product_id",
            },
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "orders",
                key: "order_id",
            },
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    });
};

module.exports = lineItemModel;
