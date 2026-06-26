import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: " Authorization header missing ", });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: " Unauthorized access ",
            });
        }
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(payload._id).select("-password -refreshToken");
        if (!user) {
            return res.status(401).json({
                message: "Invalid access token",
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid or expired access token",
        });
    }
};
export { verifyJWT };
//# sourceMappingURL=Jwt.middleware.js.map