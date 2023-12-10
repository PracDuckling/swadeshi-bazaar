const { DataTypes } = require("sequelize");

const sellerModel = (sequelize) => {
    return sequelize.define("seller", {
        seller_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            constraints: {unique: true}
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { //references object me foreign key assign karte hai
                model: 'users', //apne model ka jo naam hai usse prural karke yaha pe likhna hai
                key: 'user_id' //yaha pe jo attribute foriegn key banana hai wo likhna hai
            }
        },
        is_dnk_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        company_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        IEC: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        AD_code: {
            type: DataTypes.STRING
        },
        GSTIN: {
            type: DataTypes.STRING,
            allowNull: false
        },
        LUT: {
            type: DataTypes.STRING,
            
        },
        bond: {
            type: DataTypes.STRING,
            
        },
    });
};

module.exports = sellerModel;
