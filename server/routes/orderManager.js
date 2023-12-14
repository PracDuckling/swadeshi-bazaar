const express = require("express");

const db = require("../model/database");
const validateAuthToken = require("../middleware/validateAuthToken");
const { or } = require("sequelize");

const orderRouter = express.Router();

const Order = db.orders;
const LineItem = db.lineItems;
const User = db.users;
const Product = db.products;
const Address = db.addresses;
const Image = db.images;

orderRouter.post("/order/create", validateAuthToken, async (req, res) => {
    //TODO: handle transaction details
    //TODO: handle seller side order details (probably here we would have to create a new table that will store order details for each seller ie the order requests received by the seller)

    const user_id = req.user_id;

    const { address_id, products } = req.body;

    try {
        let result = await Order.create({
            user_id,
            address_id,
            order_status: "pending",
        });
        const order_id = result.order_id;

        for (let product of products) {
            await LineItem.create({
                product_id: product.product_id,
                order_id,
                quantity: product.quantity,
            });
            //update product quantity
            const item = await Product.findOne({
                where: {
                    product_id: product.product_id,
                },
            });
            
            product.available_quantity = item.available_quantity;
            
            let netQuantity = (parseInt(product.available_quantity) - parseInt(product.quantity)) < 0 ? 0 : (parseInt(product.available_quantity) - parseInt(product.quantity));
            
            netQuantity = netQuantity.toString();
            const isAvailable = netQuantity > 0 ? true : false;
            await Product.update({
                isAvailable,
                available_quantity: netQuantity
            },{
                where: {
                    product_id: product.product_id,
                },
            });
        }

        return res.status(201).json({message: "Order created successfully"});

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
});

orderRouter.get("/orders", validateAuthToken, async (req, res) => {
    const user_id = req.user_id;
    try {
        const orders = await Order.findAll({
            where: {
                user_id,
            },
        });
        const result = await User.findOne({
            where: {
                user_id,
            },
        });
        console.log(result);
        //TODO: debug this route
        const userDetails = {
            firstName: result.dataValues.first_name,
            lastName: result.dataValues.last_name,
        }

        let orderList = [];
        
        const orderDetails = {};
        for(order of orders) {
            //add user details to the order
            orderDetails.userDetails = userDetails;

            const lineItems = await LineItem.findAll({
                where: {
                    order_id: order.order_id,
                },
            });
            //add generic order details
            orderDetails.orderNumber = order.order_id;
            orderDetails.orderDate = order.order_date;
            orderDetails.orderStatus = order.order_status;
            orderDetails.trackingId = order.tracking_id;

            
            const address = await Address.findOne({
                where: {
                    address_id: order.address_id,
                },
            });
            //add delivery address details
            orderDetails.address = address;

            //fetch products
            const products = [];
            let total = 0;
            for(lineItem of lineItems) {
                const product = await Product.findOne({
                    where: {
                        product_id: lineItem.product_id,
                    },
                });
                const product_image = await Image.findOne({
                    where: {
                        product_id: lineItem.product_id,
                    },
                });
                //add product details
                const temp = {
                    product_name: product.product_name,
                    product_image,
                    product_price: product.product_price,
                    quantity: lineItem.quantity,
                }
                total += parseFloat(product.product_price) * parseFloat(lineItem.quantity);
                products.push(temp);
            }
            //add order total
            orderDetails.total = total;
            //add single order to the list or order
            orderList.push(orderDetails);
        }

        return res.status(200).json(orderList);

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
});


module.exports = orderRouter;
