const { DataTypes } = require("sequelize");

const productDimensionModel = (sequelize) => {
    return sequelize.define("productDimension", {
        dimension_id: {
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
        size: {
            type: DataTypes.STRING,
        },
        color: {
            type: DataTypes.STRING,
        },
        height: {
            type: DataTypes.STRING,
        },
        width: {
            type: DataTypes.STRING,
        },
        length: {
            type: DataTypes.STRING,
        },
        weight: {
            type: DataTypes.STRING,
        },
    });
};

module.exports = productDimensionModel;
