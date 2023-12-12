const express = require("express");

const db = require("../model/database");

const inventoryRouter = express.Router();

// const User = db.users;
// const Seller = db.sellers;
// const Address = db.addresses;
const Product = db.products;
const ProductCategory = db.productCategories;
const productDimensions = db.productDimensions;
const Image = db.images;


//get all products categoriy wise
