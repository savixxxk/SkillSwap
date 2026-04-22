import jwt from "jsonwebtoken";
import User from "../models/User.js";

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const decoded = jwt.verify(token, getJwtSecret());

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked by an admin" });
    }
    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (err) {
    if (err?.message === "JWT_SECRET is not configured") {
      return res.status(500).json({ message: "Server auth configuration error" });
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
