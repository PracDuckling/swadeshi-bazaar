const { DataTypes } = require("sequelize");

const productModel = (sequelize) => {
    return sequelize.define("product", {
        product_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            constraints: { unique: true },
        },
        category_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        seller_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "sellers",
                key: "seller_id",
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        HS_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rating: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 0,
        },
        isAvailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        price: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 100,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "No description",
        },
        expiry_date: {
            type: DataTypes.DATE,
        },
        manufacturing_date: {
            type: DataTypes.DATE,
        },
        available_quantity: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1,
        },
    });
};

module.exports = productModel;
