import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const generateJwtToken = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    if (!user.emailVerified) {
        const error = new Error("Please verify your email before generating a token.");
        error.statusCode = 403;
        throw error;
    }

    return jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

export default generateJwtToken;