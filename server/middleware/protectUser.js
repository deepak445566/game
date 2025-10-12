// ✅ protectUser.js - Updated for Production
import User from "../models/userModels.js";
import jwt from "jsonwebtoken";

export const protectUser = async (req, res, next) => {
  try {
    let token;

    // ✅ Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]; // remove 'Bearer '
    }
    // ✅ Fallback: Check cookies (if you're using cookies)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No token, authorization denied" 
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Get user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth Middleware Error:", error);
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired token" 
    });
  }
};