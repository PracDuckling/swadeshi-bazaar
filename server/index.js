const express = require("express");
const cookieParser = require("cookie-parser");

const dotenv = require("dotenv").config();
const db = require('./model/database');



//sync all models
try{
    db.sequelize.sync({force: true});
}catch(error){
    console.log("DB sync error: ", error);
}

//importing the routes
const userRouter = require('./routes/userManager');
const cartRouter = require("./routes/cartManager");
const inventoryRouter = require('./routes/inventoryManager');
const orderRouter = require('./routes/orderManager');

//setting up your port
const PORT = process.env.PORT || 3000;

//assigning the variable app to express
const app = express();

//middleware
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',  extended: true }));
app.use(cookieParser());


app.use('/api/v1', userRouter);
app.use('/api/v1', cartRouter);
app.use('/api/v1/', inventoryRouter);
app.use('/api/v1/', orderRouter);

app.get('*', (req, res) => res.send("404! NOT FOUND"));

//listening to server connection
app.listen(PORT, () => console.log(`Server is connected on ${PORT}`));
