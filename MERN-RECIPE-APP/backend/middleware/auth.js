import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      // Extract user ID safely
      const userId = decoded.id || decoded.userId || decoded._id;
      if (!userId) {
        console.error("No user ID found in token payload");
        return res.status(401).json({ message: "Not authorized, invalid token payload" });
      }

      req.user = await User.findById(userId).select("-password");
      if (!req.user) {
        console.error("User not found for ID:", userId);
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    console.error("No token provided in authorization header");
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};




// import User from "../models/User.js";
// import jwt from "jsonwebtoken";

// // Protect middleware: verify token & attach user
// export const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer ")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       const userId = decoded.id || decoded.userId || decoded._id;
//       if (!userId) {
//         return res.status(401).json({ message: "Not authorized, invalid token payload" });
//       }

//       req.user = await User.findById(userId).select("-password");
//       if (!req.user) {
//         return res.status(401).json({ message: "Not authorized, user not found" });
//       }

//       next();
//     } catch (error) {
//       return res.status(401).json({ message: "Not authorized, invalid token" });
//     }
//   } else {
//     return res.status(401).json({ message: "Not authorized, no token provided" });
//   }
// };

// // Admin protect middleware: only allow admins (by email or role)
// export const adminProtect = async (req, res, next) => {
//   await protect(req, res, () => {
//     if (req.user && req.user.email === "admin@gmail.com") {
//       next();
//     } else {
//       return res.status(403).json({ message: "Forbidden: Admins only" });
//     }
//   });
// };
