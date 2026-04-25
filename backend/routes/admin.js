import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();
router.use(requireAuth, requireAdmin);

// GET /admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /admin/users/:id
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sessions = await Session.find({
      $or: [{ studentId: id }, { tutorId: id }],
    })
      .sort({ time: -1 })
      .lean();

    res.json({ user, sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /admin/users/:id/block
router.patch("/users/:id/block", async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({ message: "isBlocked must be true or false" });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }
    if (target.role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be blocked" });
    }
    if (target._id.toString() === req.userId) {
      return res.status(403).json({ message: "You cannot block your own account" });
    }

    target.isBlocked = isBlocked;
    await target.save();
    const user = await User.findById(id).select("-password").lean();
    res.json({ message: isBlocked ? "User blocked" : "User unblocked", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /admin/sessions
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Session.find().sort({ time: -1 }).lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /admin/tutor-ratings
router.get("/tutor-ratings", async (req, res) => {
  try {
    const stats = await Session.aggregate([
      {
        $match: {
          "studentFeedback.rating": { $exists: true, $gte: 1, $lte: 5 },
        },
      },
      {
        $group: {
          _id: "$tutorId",
          averageRating: { $avg: "$studentFeedback.rating" },
          ratingCount: { $sum: 1 },
        },
      },
      {
        $project: {
          tutorId: "$_id",
          averageRating: { $round: ["$averageRating", 2] },
          ratingCount: 1,
          _id: 0,
        },
      },
    ]);

    const tutors = await User.find({ role: "tutor" }).select("name email certifiedTutor").lean();
    const tutorMap = tutors.reduce((acc, tutor) => {
      acc[tutor._id.toString()] = tutor;
      return acc;
    }, {});

    const list = stats.map((item) => ({
      ...item,
      tutor: tutorMap[item.tutorId.toString()] || null,
    }));

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
