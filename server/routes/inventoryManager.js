const express = require("express");

const db = require("../model/database");

const inventoryRouter = express.Router();

const validateAuthToken = require("../middleware/validateAuthToken");

const { upload, uploadMultiple } = require("../middleware/multer");
const {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} = require("firebase/storage");
const { signInWithEmailAndPassword } = require("firebase/auth");
const { auth } = require("../config/firebase.config");

const Product = db.products;
const ProductCategory = db.productCategories;
const ProductDimensions = db.productDimensions;
const Image = db.images;

const uploadImage = async (file, quantity) => {
    const storageFB = getStorage();

    await signInWithEmailAndPassword(
        auth,
        process.env.FIREBASE_USER,
        process.env.FIREBASE_AUTH
    );

    const dateTime = Date.now();
    const fileName = `images/${dateTime}`;
    const storageRef = ref(storageFB, fileName);
    const metadata = {
        contentType: file.type,
    };
    const res = await uploadBytesResumable(storageRef, file.buffer, metadata);
    const url = await getDownloadURL(res.ref);
    return { fileName, url };
};

//get image and upload to firebase

inventoryRouter.post("/product/image/upload", upload, async (req, res) => {
    const file = {
        type: req.file.mimetype,
        buffer: req.file.buffer,
    };

    try {
        const imgDetails = await uploadImage(file);
        return res
            .status(201)
            .json({ message: "Image upload successful", imgDetails });
        //these details would be consumed by the forntend incl the image url
        //We will then move on and fill other details about the product and then
        //send the imageDetails with the http post request to create product
    } catch (error) {
        console.log("image upload error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//create product
inventoryRouter.post("/product/create", validateAuthToken, async (req, res) => {
    const seller_id = req.seller_id;
    if (!seller_id) {
        //access denied, you must be a seller to register a product
        res.status(403).json("Access Denied");
    }

    const {
        productDetails,
        productDimensions,
        productCategory,
        productImages,
    } = req.body;

    try {
        
        let result = await ProductCategory.findOne({
            where: {
                product_category_1: productCategory.product_category_1,
                product_category_2: productCategory.product_category_2,
            },
        });
        
        //extract category_id from result
        
        let category_id = undefined;
        if(result) category_id = result.dataValues.category_id;
        let product_id;
        if (!category_id) {
            result = await Product.create({
                ...productDetails,
                seller_id,
            });
            category_id = result.category_id;
            product_id = result.product_id;
            await ProductCategory.create({
                category_id,
                product_id,
                ...productCategory,
            });
        }else{
            result = await Product.create({
                ...productDetails,
                seller_id,
                category_id,
            });
            product_id = result.product_id;
        }
        

        

        await ProductDimensions.create({
            product_id,
            ...productDimensions,
        });

        await Image.create({
            product_id,
            ...productImages,
        });

        return res
            .status(201)
            .json({ message: "Product created successfully" });
    } catch (error) {
        console.log("product creation error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//view product
inventoryRouter.get("/product/:product_id", async (req, res) => {
    const { product_id } = req.params;
    const result = {};
    try {
        result.productDetails = await Product.findOne({
            where: {
                product_id,
            },
        });
        result.productCategory = await ProductCategory.findOne({
            where: {
                product_id,
            },
        });
        result.productDimensions = await ProductDimensions.findOne({
            where: {
                product_id,
            },
        });
        result.productImages = await Image.findAll({ where: { product_id } });

        if (!result) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Product found", result });
    } catch (error) {
        console.log("product view error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//update product
inventoryRouter.put("/product/:product_id", async (req, res) => {
    const { product_id } = req.params;
    const { productDetails } = req.body;

    try {
        const result = await Product.update(productDetails, {
            where: {
                product_id,
            },
        });

        if (!result) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Product updated" });
    } catch (error) {
        console.log("product update error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//delete product
inventoryRouter.delete("/product/:product_id", async (req, res) => {
    const { product_id } = req.params;

    try {
        //check if product exists or not
        let result = await Product.findOne({
            where: {
                product_id,
            },
        });

        if (result === null) {
            return res.status(404).json({ message: "Product not found" });
        }

        //delete product images

        await Image.destroy({
            where: {
                product_id,
            },
        });

        //delete product dimensions
        await ProductDimensions.destroy({
            where: {
                product_id,
            },
        });

        //delete product category
        await ProductCategory.destroy({
            where: {
                product_id,
            },
        });

        await Product.destroy({
            where: {
                product_id,
            },
        });

        return res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        console.log("product delete error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//get all products
inventoryRouter.get("/products", async (req, res) => {
    try {
        const result = await Product.findAll();
        return res.status(200).json({ message: "Products found", result });
    } catch (error) {
        console.log("products view error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//get all products by category
inventoryRouter.get("/products/:category_id", async (req, res) => {
    const { category_id } = req.params;

    try {
        const result = await Product.findAll({
            where: {
                category_id,
            },
        });

        if (!result) {
            return res.status(404).json({ message: "Products not found" });
        }

        return res.status(200).json({ message: "Products found", result });
    } catch (error) {
        console.log("products view error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//send  category_id and product_category_1, product_category_2 with the description to the frontend
inventoryRouter.get("/categories", async (req, res) => {
    try {
        const result = await ProductCategory.findAll();
        return res.status(200).json({ message: "Categories found", result });
    } catch (error) {
        console.log("categories view error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//end

module.exports = inventoryRouter;
