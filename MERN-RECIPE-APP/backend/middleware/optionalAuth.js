import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userId = decoded.id || decoded.userId || decoded._id;
      if (!userId) {
        req.user = null; // no user info
        return next();
      }

      const user = await User.findById(userId).select("-password");
      if (!user) {
        req.user = null;
        return next();
      }

      req.user = user;
      next();
    } catch (error) {
      // Token invalid or expired, just continue as guest
      req.user = null;
      next();
    }
  } else {
    // No token provided, continue as guest
    req.user = null;
    next();
  }
};
