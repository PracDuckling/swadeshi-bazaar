const { DataTypes } = require("sequelize");

const sellerOrderModel = (sequelize) => {
    return sequelize.define("sellerOrder", {
        seller_order_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            constraints: { unique: true },
        },
        seller_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "sellers",
                key: "seller_id",
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
        address_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "addresses",
                key: "address_id",
            },
        },
        payment_method: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "online",
        },
    });
};

module.exports = sellerOrderModel;
