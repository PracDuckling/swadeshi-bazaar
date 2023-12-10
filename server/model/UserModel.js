const { DataTypes } = require("sequelize");
//import aur export karne ke 2 tarike hai ye unme se ek hai
//require(<path to the file>)
const userModel = (sequelize) => {
    return sequelize.define("user", {
        user_id: {
            type: DataTypes.UUID, //UUID matlab Universal Unique Identifier, ye ek datatype hai sql me isme ek string generate hoti hai jo unique hoti hai
            primaryKey: true, //kisi attribute ko primary key banane ke liyey ye likhte hai
            allowNull: false, //aagar ye nahi likhenge to default value NULL hogi database me
            defaultValue: DataTypes.UUIDV4, //yaha pe hum default value UUIDV4 de rahe hai, ye value automatically generate ho jaygi
            constraints:{unique: true,} //primary key ko humesha unique declare karna hota hai nahi to foreign key banane me problem aa jaygi.
        },
        user_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_middle_name: {
            type: DataTypes.STRING,
        },
        user_last_name: {
            type: DataTypes.STRING,
        },
    });
};


//import aur export ke 2 tarike hai ye unme se ek hai
module.exports = userModel;
//module.exports = <jo bhi export karna ho>