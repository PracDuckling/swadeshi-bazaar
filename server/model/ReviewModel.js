const { DataTypes } = require("sequelize");

const reviewModel = (sequelize) => {
    return sequelize.define("review", {
        review_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            constraints: { unique: true },
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id",
            },
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "products",
                key: "product_id",
            },
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
};

module.exports = reviewModel;
