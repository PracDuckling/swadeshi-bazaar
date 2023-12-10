const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../model/database");


const SECRET = "secret hai bhai";
const userRouter = express.Router();

const User = db.users;
const Seller = db.sellers;
const Address = db.addresses;

userRouter.get("/user/profile", async (req, res) => {
    const { user_id } = req.body;

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

        return res.status(200).json({ message: "User found", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "something went wrong", error });
    }
});

userRouter.get("/seller/profile", async (req, res) => {
    const { user_id } = req.body;

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

        return res.status(200).json({ message: "User found", user });
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

        await Seller.create(seller);

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
                email
            }
        });
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

        await Address.update(saveAddress, {
            where: {
                user_id
            }
        });

        const token = jwt.sign({ user_id, email }, SECRET, {
            expiresIn: "1d",
        });
        
        const data = { email, user_id };
        return res
            .status(201)
            .json({ messaage: "Account successfully updated", data, token });
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

        const token = jwt.sign({ user_id, email }, SECRET, {
            expiresIn: "1d",
        });

        const data = { email, user_id };
        return res
            .status(201)
            .json({ messaage: "Account successfully updated", data, token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "something went wrong", error });
    }

});

module.exports = userRouter;
