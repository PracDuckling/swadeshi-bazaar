const express = require("express");

const db = require("../model/database");
const validateAuthToken = require("../middleware/validateAuthToken");
const Cart = db.carts;
const Product = db.products;
const Image = db.images;

const SECRET = process.env.SECRET;
const cartRouter = express.Router();
//TODO: test this code
cartRouter.get("/cart", validateAuthToken, async (req, res) => {
    const user_id = req.user_id;
    try {
        const items = await Cart.findAll({
            where: {
                user_id,
            },
        });

        //items will have an array of objects with product_id and quantity
        //we need to get the product details from the Product table
        //we need to get the image from the Image table
        //for every product we need to calculate the total price
        //we need to calculate the total price of all the products combined
        //all this data along with the quantity of each product needs to be sent to the frontend 
        const cartItems = [];
        let total_cart_price = 0;
        for(item of items){
            const productDetails = {};
            const product = await Product.findOne({
                where: {
                    product_id: item.product_id
                },
                include: {
                    model: Image,
                    attributes: ["image_url"]
                },
                attributes: ["product_id", "name", "price", "discount"]
            });
            productDetails.product = product;
            productDetails.quantity = item.quantity;
            productDetails.total_price = parseFloat(product.price) * parseInt(item.quantity);
            total_cart_price += item.dataValues.total_price;
            cartItems.push(productDetails);
        }
        
        return res.status(200).json({cartItems, total_cart_price});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
    
});

//update cart given user_id from req object and product details from req.body
cartRouter.post("/cart/update", validateAuthToken, async (req, res) => {
    const user_id = req.user_id;
    const product_id = req.body.product_id;
    const quantity = req.body.quantity;
    
    try {
        const cart = await Cart.findOne({
            where: {
                user_id,
                product_id
            },
        });

        //if the quantity is 0 then delete the entry from the cart table
        if(quantity === 0){
            await cart.destroy();  
            return res.status(200).json({message: "Cart updated successfully"});
        }

        //if the result of findOne method gives values then update the quantity of the product
        if(cart){
            cart.quantity = quantity;
            await cart.save();
        }
        //else create a new entry in the cart table
        else{
            await Cart.create({
                user_id,
                product_id,
                quantity
            });
        }
        
        
        return res.status(200).json({message: "Cart updated successfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
});

//clear cart given user_id from req object
cartRouter.post("/cart/clear", validateAuthToken, async (req, res) => {
    const user_id = req.user_id;
    try {
        await Cart.destroy({
            where: {
                user_id
            }
        });
        return res.status(200).json({message: "Cart cleared successfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
});

module.exports = cartRouter;
