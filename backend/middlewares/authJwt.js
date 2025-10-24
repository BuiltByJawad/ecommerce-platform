import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../config/database.config.js";
import errorResponse from "../utils/errorResponse.js";

dotenv.config();

const User = db.model.User;

// Verify token from cookie or Authorization header and attach user
export const verifyToken = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.access_token;
    const authHeader = req.headers?.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No access token provided" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized - Access token has expired" });
    }
    errorResponse(
      500,
      "ERROR",
      error.message || "Some error occurred while verifying token",
      res
    );
  }
};

export const protectedRoute = verifyToken;

export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied - Admin only" });
};

export const companyRoute = (req, res, next) => {
  if (req.user && req.user.role === "company") {
    return next();
  }
  return res.status(403).json({ message: "Access denied" });
};
