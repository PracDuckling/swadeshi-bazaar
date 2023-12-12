const { DataTypes } = require("sequelize");

const imageModel = (sequelize) => {
    return sequelize.define("image", {
        image_id: {
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
        image_data: {
            type: DataTypes.BLOB("long"),
            allowNull: false,
        },
        image_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
};

module.exports = imageModel;
