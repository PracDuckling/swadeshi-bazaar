const { DataTypes } = require("sequelize");

const addressModel = (sequelize) => {
    return sequelize.define("address", {
        address_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            constraints: {unique: true,}
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id",
            },
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        is_default: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        PIN_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        street_add_1: {
            type: DataTypes.STRING,
            allowNull: false
        },
        street_add_2: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });
};

module.exports = addressModel;