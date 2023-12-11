const { DataTypes } = require("sequelize");

const orderModel = (sequelize) => {
    return sequelize.define("order", {
        order_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            constraints: { unique: true },
        },
        address_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "addresses",
                key: "address_id",
            },
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id",
            },
        },
        order_status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        order_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        tracking_id: {
            type: DataTypes.STRING,
            allowNull: false,

        },
    });
};

module.exports = orderModel;
