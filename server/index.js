const express = require("express");
const cookieParser = require("cookie-parser");

const dotenv = require("dotenv").config();
const db = require('./model/database');



//sync all models
try{
    db.sequelize.sync();
}catch(error){
    console.log("DB sync error: ", error);
}

//importing the routes
const userRouter = require('./routes/userManager');
//setting up your port
const PORT = process.env.PORT || 3000;

//assigning the variable app to express
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

db.sequelize.sync({alter: true});

app.use('/api/v1', userRouter);

app.get('*', (req, res) => res.send("404! NOT FOUND"));

//listening to server connection
app.listen(PORT, () => console.log(`Server is connected on ${PORT}`));

//TODO: Transaction Manager and its models
//TODO: CartManager and its models