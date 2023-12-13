const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;


const validateAuthToken = (req, res, next) => {
    if (!req.path.includes("signin") && !req.path.includes("signup")) {
        try {
            let token = req.headers.authorization;
            if (!token) {
                throw new Error();
            }

            token = token.split(" ")[1];
            const user = jwt.verify(token, SECRET);
            req.user_id = user.user_id;
            req.email = user.email;
            if(user.seller_id)
                req.seller_id = seller_id;
        } catch (error) {
            return res
                .status(401)
                .json({ message: "unauthorized user", error});
        }
    }
    next();
};

module.exports = validateAuthToken;
