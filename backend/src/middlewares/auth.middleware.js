const jwt = require("jsonwebtoken");
const User = require("../models/users.models");
const { JWT_SECRET } = require("../config/config");

const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user and attach to request
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found with this token.",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Not authorized. Token is invalid or expired.",
    });
  }
};

// Fixed adminOnly middleware (was using wrong 'req.cus')
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized. Admin access required.",
    });
  }
};

// Fixed userOnly middleware (was using wrong 'req.cus')
const userOnly = (req, res, next) => {
  if (req.user && (req.user.role === "user" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized. User access required.",
    });
  }
};

module.exports = {
  protect,
  adminOnly,
  userOnly,
};