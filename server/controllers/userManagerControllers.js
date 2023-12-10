const jwt = require("jsonwebtoken");
const db = require("../model/db");
const bcrypt = require("bcrypt");
const SECRET = process.env.JWT_SECRET;

const signup = async (req, res) => {
    
};

const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        //fetch the user by email
        let result = await db.query(
            "SELECT account_id, email, password FROM accounts WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email" });
        }

        //check if the password is correct or not
        const hashedPassword = result.rows[0].password;
        const validPassword = await bcrypt.compare(password, hashedPassword);

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const accountId = result.rows[0].account_id;

        //fetch the displayName and accountId to generate for jwt generation
        result = await db.query(
            "SELECT display_name FROM users WHERE account_id = $1",
            [accountId]
        );
        displayName = result.rows[0].display_name;

        //generate token
        const token = jwt.sign({ displayName, accountId }, SECRET, {
            expiresIn: "1d",
        });

        return res.status(200).json({
            message: "signin successful",
            token,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "someting went wrong" });
    }
};

module.exports = {
    signup,
    signin,
};
