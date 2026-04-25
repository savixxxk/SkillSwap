import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Session from "../models/Session.js";

const router = express.Router();

/** Certified tutors with aggregated ratings, sorted by highest average rating first. */
router.get("/directory", async (req, res) => {
  try {
    const tutors = await User.find({ role: "tutor", certifiedTutor: true })
      .select("name teachingSubjects bio")
      .lean();

    const stats = await Session.aggregate([
      {
        $match: {
          studentFeedback: { $exists: true, $ne: null },
          "studentFeedback.rating": { $exists: true, $gte: 1, $lte: 5 },
        },
      },
      {
        $group: {
          _id: "$tutorId",
          averageRating: { $avg: "$studentFeedback.rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const statMap = {};
    for (const s of stats) {
      statMap[s._id.toString()] = {
        averageRating: Math.round(s.averageRating * 10) / 10,
        reviewCount: s.reviewCount,
      };
    }

    const enriched = tutors.map((t) => {
      const st = statMap[t._id.toString()];
      return {
        _id: t._id,
        name: t.name,
        bio: t.bio || "",
        teachingSubjects: t.teachingSubjects || [],
        averageRating: st?.averageRating ?? null,
        reviewCount: st?.reviewCount ?? 0,
      };
    });

    enriched.sort((a, b) => {
      const ar = a.averageRating ?? 0;
      const br = b.averageRating ?? 0;
      if (br !== ar) return br - ar;
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      return String(a.name).localeCompare(String(b.name));
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** Recent reviews for tutor profile modal */
router.get("/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const sessions = await Session.find({
      tutorId: id,
      "studentFeedback.rating": { $exists: true, $gte: 1 },
    })
      .sort({ "studentFeedback.submittedAt": -1 })
      .limit(15)
      .select("studentName studentFeedback subject")
      .lean();

    const list = sessions.map((s) => ({
      student: s.studentName,
      rating: s.studentFeedback.rating,
      comment: s.studentFeedback.comment || "",
      submittedAt: s.studentFeedback.submittedAt,
      subject: s.subject,
    }));

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
