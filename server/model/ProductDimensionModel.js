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
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        height: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        width: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        length: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        weight: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
};

module.exports = productDimensionModel;
