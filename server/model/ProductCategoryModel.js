const { DataTypes } = require("sequelize");

const productCategoryModel = (sequelize) => {
    return sequelize.define("productCategory", {
        category_id: {
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
        product_category_1: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        product_category_2: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    });
};

module.exports = productCategoryModel;
