import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );
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
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
