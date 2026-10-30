import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";


//middleware function to authenticate user with jwt token
const authenticateUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    const error = new Error("Authentication required. Please log in.");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    const error = new Error("Please log in again.");
    error.statusCode = 401;
    return next(error);
  }
});

export default authenticateUser;