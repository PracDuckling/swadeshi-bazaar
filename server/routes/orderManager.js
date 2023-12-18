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
const SellerOrder = db.sellerOrders;

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
            
            //for every product get the seller_id and in the sellerOrder table create a new entry
            const seller_id = item.seller_id;
            let result = await SellerOrder.findOne(
                {
                    where: {
                        seller_id,
                        order_id,
                    },
                }
            )
            if(result === null) {
                await SellerOrder.create({
                    seller_id,
                    order_id,
                    address_id,
                });
            }
            
            let netQuantity = (parseInt(item.available_quantity) - parseInt(product.quantity)) < 0 ? 0 : (parseInt(item.available_quantity) - parseInt(product.quantity));
            
            const isAvailable = netQuantity > 0 ? true : false;
            netQuantity = netQuantity.toString();
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

orderRouter.get("/user/orders", validateAuthToken, async (req, res) => {
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


        const userDetails = {
            firstName: result.dataValues.user_first_name,
            lastName: result.dataValues.user_last_name,
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
                    product_name: product.dataValues.name,
                    product_image: product_image.dataValues.image_url,
                    product_price: product.dataValues.price,
                    quantity: lineItem.quantity,
                }
                total += parseFloat(product.price) * parseFloat(lineItem.quantity);
                products.push(temp);
            }
            //add order total
            orderDetails.products = products;
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

//TODO: test the sellerOrder functionality 

orderRouter.get("/seller/orders", validateAuthToken, async (req, res) => {
    if(!req.seller_id){
        return res.status(401).json({message: "Unauthorized"});
    }
    const seller_id = req.seller_id;
    try {
        //get all orders
        const sales = await SellerOrder.findAll({
            where: {
                seller_id,
            },
        });
        let orderList = [];
        for(sale of sales) {
            const orderDetails = {};
            const order = await Order.findOne({
                where: {
                    order_id: sale.order_id,
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
            
            let total = 0;
            const products = [];
            const lineItems = await LineItem.findAll({
                where: {
                    order_id: order.order_id,
                },
            });

           //for every lineItem check if the product is made by the seller with seller_id
           //if yes then add its details to product information elase skip it

           for(lineItem of lineItems) { 
                const product = await Product.findOne({
                    where: {
                        product_id: lineItem.product_id,
                        seller_id,
                    },
                });
                if(product){
                    const product_image = await Image.findOne({
                        where: {
                            product_id: lineItem.product_id,
                        },
                    });
                    //add product details
                    const temp = {
                        product_name: product.dataValues.name,
                        product_image: product_image.dataValues.image_url,
                        product_price: product.dataValues.price,
                        quantity: lineItem.quantity,
                    }
                    total += parseFloat(product.price) * parseFloat(lineItem.quantity);
                    products.push(temp);
                }
            }
            //add order total
            orderDetails.products = products;
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

//update order status
orderRouter.put("/order/:order_id", validateAuthToken, async (req, res) => {
    if(!req.seller_id){
        return res.status(401).json({message: "Unauthorized"});
    }
    const { order_id } = req.params;
    const { order_status } = req.body;
    try {
        const order = await Order.findOne({
            where: {
                order_id,
            },
        });
        if(order === null) {
            return res.status(404).json({message: "Order not found"});
        }
        await Order.update({
            order_status,
        },{
            where: {
                order_id,
            },
        });
        return res.status(200).json({message: "Order status updated"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
});


module.exports = orderRouter;
