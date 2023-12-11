const { Sequelize } = require("sequelize");

//import models

const db = {};


const sequelize = new Sequelize("swadeshi-bazaar", "postgres", process.env.DB_PASSWORD, {
    host: "localhost",
    dialect: "postgres",
});

try {
    //store sequelize stuff in the DB
    db.Sequelize = Sequelize;
    db.sequelize = sequelize;

    sequelize.authenticate();
    console.log("Connection has been established successfully.");

    db.users = require("./UserModel")(sequelize);
    db.sellers = require("./SellerModel")(sequelize);
    db.bankDetails = require('./BankDetailModel')(sequelize);
    db.addresses = require('./AddressModel')(sequelize);
    db.products = require('./ProductModel')(sequelize);
    db.productCategories = require('./ProductCategoryModel')(sequelize);
    db.productDimensions = require('./ProductDimensionModel')(sequelize);
    db.reviews = require('./ReviewModel')(sequelize);
} catch (error) {
    console.error("Unable to connect to the database:", error);
}

//exporting the module
module.exports = db;
