import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js";
import tutorDirectoryRoutes from "./routes/tutorDirectory.js";
import adminRoutes from "./routes/admin.js";
import adminQuizRoutes from "./routes/adminQuizRoutes.js";
import tutorQuizRoutes from "./routes/tutorQuizRoutes.js";

dotenv.config();
const app = express();

const shouldUsePublicDns = process.env.USE_PUBLIC_DNS !== "false";
if (shouldUsePublicDns) {
  const configuredServers = (process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (configuredServers.length > 0) {
    try {
      dns.setServers(configuredServers);
      console.log(`Using DNS servers: ${configuredServers.join(", ")}`);
    } catch (err) {
      console.warn("Could not set custom DNS servers:", err.message);
    }
  }
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/auth", authRoutes);
app.use("/sessions", sessionRoutes);
app.use("/tutors", tutorDirectoryRoutes);
app.use("/admin", adminRoutes);
app.use("/api/admin", adminQuizRoutes);
app.use("/api/tutor", tutorQuizRoutes);

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.warn(
    "MONGO_URI is not set in .env — set it to your MongoDB connection string.",
  );
}
mongoose
  .connect(mongoUri || "mongodb://127.0.0.1:27017/skillswap", {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    if (String(err.message || "").includes("querySrv ECONNREFUSED")) {
      console.error(
        "Atlas SRV lookup failed. If this persists, set a direct mongodb:// URI in MONGO_URI or configure DNS_SERVERS in backend/.env.",
      );
    }
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
