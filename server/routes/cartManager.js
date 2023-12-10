const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../model/database");


const SECRET = process.env.SECRET;
const cartRouter = express.Router();

cartRouter.get("/cart/view-cart", (req, res)=>{
    return res.json({message:"Viewing cart items"})
})

module.exports = cartRouter;