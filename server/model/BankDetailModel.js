const { DataTypes } = require("sequelize");

const bankDetailModel = (sequelize) => {
    return sequelize.define("bankDetail", {
        bank_detail_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            constraints: {unique: true,}
        },
        seller_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "sellers",
                key: "seller_id",
            },
        },
        account_holder_first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        account_holder_middle_name: {
            type: DataTypes.STRING,
        },
        account_holder_last_name: {
            type: DataTypes.STRING,
        },
        bank_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        branch_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        branch_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bank_acc_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
};

module.exports = bankDetailModel;
