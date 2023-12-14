const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../model/database");
const validateAuthToken = require('../middleware/validateAuthToken');


const SECRET = process.env.SECRET;
const userRouter = express.Router();

const User = db.users;
const Seller = db.sellers;
const Address = db.addresses;

userRouter.get("/user/profile", validateAuthToken ,async (req, res) => {
    const user_id = req.user_id;

    try {
        const result = await User.findAll({
            where: {
                user_id,
            },
        });

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const user = result[0].dataValues;

        const address = await Address.findAll({
            where: {
                user_id,
            },
        });



        return res.status(200).json({ message: "User found", user, address });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "something went wrong", error });
    }
});

userRouter.get("/seller/profile", validateAuthToken,async (req, res) => {
    const user_id = req.user_id;

    try {
        const result = await User.findAll({
            where: {
                user_id,
            },
        });

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const user = result[0].dataValues;

        const seller = await Seller.findAll({
            where: {
                user_id,
            },
        });
        if(seller.length === 0){
            return res.status(404).json({
                message: "Seller not found",
            });
        }
        return res.status(200).json({ message: "User found", user, seller });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "something went wrong", error });
    }
});

userRouter.post("/user/create", async (req, res) => {
    const { firstName, middleName, lastName, email, phone, password, address } = req.body;

    try {
        //check if the user already exists or not via email
        let result = await User.findAll({
            where: {
                email
            },
        });
        
        if(result.length > 0){
            return res.status(409).json({
                message: "This email is already linked to a different account",
            });
        }

        result = await User.findAll({
            where: {
                phone
            }
        });

        if (result.length > 0) {
            return res.status(409).json({
                message: "This phone is already linked to a different account",
            });
        }

        //create the user object which will then be inserted in the 

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //save the user to the db
        //create a user object
        const user = {
            user_type: "buyer", 
            email,
            password: hashedPassword,
            phone,
            user_first_name: firstName,
            user_middle_name: middleName,
            user_last_name: lastName,
        };

        result = await User.create(user);
        const user_id = result.user_id;
        

        //create an address table

        const saveAddress = {
            user_id,
            phone,
            is_default: true,
            PIN_code: address.PIN_code,
            city: address.city,
            state: address.state,
            country: address.country,
            street_add_1: address.street_add_1,
            street_add_2: address.street_add_2
        };

        await Address.create(saveAddress);

        const token = jwt.sign({ user_id, email }, SECRET, {
            expiresIn: "1d",
        });
        
        const data = { email, user_id };
        return res
            .status(201)
            .json({ messaage: "Account successfully created", data, token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "something went wrong", error });
    }
});

userRouter.post("/seller/create", async (req, res) => {
    const {
        email,
        phone,
        password,
        address,
        company_name,
        IEC,
        AD_code,
        GSTIN,
        LUT,
        bond,
    } = req.body;

    //check if user already exists via email
    try {
        let result = await User.findAll({
            where: {
                email,
            },
        });

        if (result.length > 0) {
            return res.status(409).json({
                message: "This email is already linked to a different account",
            });
        }

        result = await User.findAll({
            where: {
                phone,
            },
        });

        if (result.length > 0) {
            return res.status(409).json({
                message: "This phone is already linked to a different account",
            });
        }

        //create the user object which will then be inserted in the

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //save the user to the db
        //create a user object
        const user = {
            user_type: "seller",
            email,
            password: hashedPassword,
            phone,
            user_first_name: company_name
        };

        result = await User.create(user);
        const user_id = result.user_id;

        //create a seller object
        const seller = {
            user_id,
            is_dnk_verified: false,
            company_name,
            IEC,
            AD_code,
            GSTIN,
            LUT,
            bond,
        };

        result = await Seller.create(seller);
        const seller_id = result.seller_id;

        //add the address to the address table
        const saveAddress = {
            user_id,
            phone,
            is_default: true,
            PIN_code: address.PIN_code,
            city: address.city,
            state: address.state,
            country: address.country,
            street_add_1: address.street_add_1,
            street_add_2: address.street_add_2,
        };
        
        //save data to address table
        await Address.create(saveAddress);

        const token = jwt.sign({ user_id, seller_id, email }, SECRET, {
            expiresIn: "10d",
        });

        const data = { email, user_id };
        return res
            .status(201)
            .json({ messaage: "Account successfully created", data, token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "something went wrong", error });
    }
    
    
});

userRouter.post("/user/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await User.findAll({
            where: {
                email,
            },
        });

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const user = result[0].dataValues;

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign({ user_id: user.user_id, email }, SECRET, {
            expiresIn: "1d",
        });

        const data = { email, user_id: user.user_id };
        return res.status(200).json({ message: "Login successful", data, token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "something went wrong", error });
    }
});

userRouter.post("/seller/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await User.findAll({
            where: {
                email,
            },
        });

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const user = result[0].dataValues;

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign({ user_id: user.user_id, email }, SECRET, {
            expiresIn: "1d",
        });

        const data = { email, user_id: user.user_id };
        return res.status(200).json({ message: "Login successful", data, token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "something went wrong", error });
    }
});

userRouter.put("/user/update", async (req, res) => {
    const { firstName, middleName, lastName, email, phone, password, address } = req.body;

    try {
        //check if the user already exists or not via email
        let result = await User.findAll({
            where: {
                email
            },
        });
        
        if(result.length === 0){
            return res.status(404).json({
                message: "This email is not linked to any account",
            });
        }

        result = await User.findAll({
            where: {
                phone
            }
        });

        if (result.length === 0) {
            return res.status(404).json({
                message: "This phone is not linked to any account",
            });
        }

        const user_id = result[0].dataValues.user_id;

        //create the user object which will then be inserted in the 

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        //save the user to the db
        //create a user object
        const user = {
            user_type: "buyer", 
            email,
            password: hashedPassword,
            phone,
            user_first_name: firstName,
            user_middle_name: middleName,
            user_last_name: lastName,
        };

        result = await User.update(user, {
            where: {
                user_id
            }
        });
        

        //create an address table

        const saveAddress = {
            user_id,
            phone,
            is_default: true,
            PIN_code: address.PIN_code,
            city: address.city,
            state: address.state,
            country: address.country,
            street_add_1: address.street_add_1,
            street_add_2: address.street_add_2
        };

        await Address.update(saveAddress, {
            where: {
                user_id
            }
        });
        
        const data = { email, user_id };
        return res
            .status(201)
            .json({ messaage: "Account successfully updated", data});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "something went wrong", error });
    }
});

userRouter.put("/seller/update", async (req, res) => {
    const {
        email,
        phone,
        password,
        address,
        company_name,
        IEC,
        AD_code,
        GSTIN,
        LUT,
        bond,
    } = req.body;

    //check if user already exists via email
    try {
        let result = await User.findAll({
            where: {
                email,
            },
        });

        if (result.length === 0) {
            return res.status(404).json({
                message: "This email is not linked to any account",
            });
        }

        result = await User.findAll({
            where: {
                phone,
            },
        });

        if (result.length === 0) {
            return res.status(404).json({
                message: "This phone is not linked to any account",
            });
        }

        const user_id = result[0].dataValues.user_id;
        //create the user object which will then be inserted in the

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //save the user to the db
        //create a user object
        const user = {
            user_type: "seller",
            email,
            password: hashedPassword,
            phone,
            user_first_name: company_name
        };

        result = await User.update(user, {
            where: {
                email
            }
        });
        

        //create a seller object
        const seller = {
            user_id,
            is_dnk_verified: false,
            company_name,
            IEC,
            AD_code,
            GSTIN,
            LUT,
            bond,
        };

        await Seller.update(seller, {
            where: {
                user_id
            }
        });

        //add the address to the address table
        const saveAddress = {
            user_id,
            phone,
            is_default: true,
            PIN_code: address.PIN_code,
            city: address.city,
            state: address.state,
            country: address.country,
            street_add_1: address.street_add_1,
            street_add_2: address.street_add_2,
        };
        
        //save data to address table
        await Address.update(saveAddress, {
            where: {
                user_id
            }
        });

        const data = { email, user_id };
        return res
            .status(201)
            .json({ messaage: "Account successfully updated", data});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "something went wrong", error });
    }

});

//send all addresses of the user with the user_id in req object
userRouter.get('/user/address', validateAuthToken, async (req, res) => {
    const user_id = req.user_id;

    try{
        let result = await Address.findAll({
            where: {
                user_id
            }
        });

        return res.status(200).json({ message: "Addresses found", result });

    }catch(error){
        console.log(error);
        return res.status(500).json({ message: "something went wrong", error });
    }

});

//add new address
userRouter.post("/user/address/create", validateAuthToken, async (req, res) => {
    const user_id = req.user_id;
    const { phone, address } = req.body;

    try{
        const saveAddress = {
            user_id,
            phone,
            is_default: false,
            PIN_code: address.PIN_code,
            city: address.city,
            state: address.state,
            country: address.country,
            street_add_1: address.street_add_1,
            street_add_2: address.street_add_2
        };

        await Address.create(saveAddress);

        return res.status(201).json({ message: "Address successfully created" });

    }catch(error){
        console.log(error);
        return res.status(500).json({ message: "something went wrong", error });
    }
});


module.exports = userRouter;
