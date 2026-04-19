// routes/session.js
import express from "express";
import mongoose from "mongoose";
import Session from "../models/Session.js";
import User from "../models/User.js";

const router = express.Router();

function sessionHasEnded(session) {
  const start = new Date(session.time).getTime();
  const mins = session.durationMinutes ?? 60;
  const end = start + mins * 60 * 1000;
  return Date.now() > end;
}

// Certified tutors for student booking dropdown
router.get("/certified-tutors", async (req, res) => {
  try {
    const tutors = await User.find({ role: "tutor", certifiedTutor: true })
      .select("name teachingSubjects")
      .lean();
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student creates a session request
router.post("/book", async (req, res) => {
  try {
    const {
      studentId,
      tutorId,
      studentName,
      tutorName,
      subject,
      time,
      location,
    } = req.body;

    if (
      !studentId ||
      !tutorId ||
      !studentName ||
      !tutorName ||
      !subject ||
      !time ||
      !location
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(tutorId)
    ) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const tutor = await User.findOne({
      _id: tutorId,
      role: "tutor",
      certifiedTutor: true,
    });
    if (!tutor) {
      return res.status(400).json({ message: "Invalid or uncertified tutor" });
    }
    if (!tutor.teachingSubjects.includes(subject)) {
      return res
        .status(400)
        .json({ message: "This tutor does not offer that subject" });
    }

    const rawDur = Number(req.body.durationMinutes);
    const durationMinutes = Number.isFinite(rawDur)
      ? Math.min(180, Math.max(30, Math.round(rawDur)))
      : 60;

    const session = new Session({
      studentId,
      tutorId,
      studentName,
      tutorName,
      subject,
      time: new Date(time),
      durationMinutes,
      location,
      status: "pending",
    });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tutor: feedback received (for ratings card) — before generic tutor/user route
router.get("/tutor/user/:userId/feedbacks", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const sessions = await Session.find({
      tutorId: userId,
      "studentFeedback.rating": { $exists: true, $ne: null },
    }).sort({ "studentFeedback.submittedAt": -1 });

    const list = sessions.map((s) => ({
      _id: s._id,
      student: s.studentName,
      rating: s.studentFeedback.rating,
      feedback: s.studentFeedback.comment || "",
      submittedAt: s.studentFeedback.submittedAt,
      subject: s.subject,
    }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tutor sessions by user id (preferred)
router.get("/tutor/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const sessions = await Session.find({ tutorId: userId }).sort({
      time: 1,
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Legacy: tutor sessions by display name
router.get("/tutor/:name", async (req, res) => {
  try {
    const sessions = await Session.find({ tutorName: req.params.name });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student sessions by user id
router.get("/student/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const sessions = await Session.find({ studentId: userId }).sort({
      time: 1,
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Legacy: student sessions by name
router.get("/student/:name", async (req, res) => {
  try {
    const sessions = await Session.find({ studentName: req.params.name });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student submits feedback after session end
router.post("/:id/feedback", async (req, res) => {
  try {
    const { studentId, rating, comment } = req.body;
    if (!studentId || rating === undefined || rating === null) {
      return res
        .status(400)
        .json({ message: "studentId and rating are required" });
    }

    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: "Rating must be 1–5" });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.studentId.toString() !== String(studentId)) {
      return res.status(403).json({ message: "Not your session" });
    }

    if (session.status !== "accepted") {
      return res
        .status(400)
        .json({ message: "Only accepted sessions can be rated" });
    }

    if (session.studentFeedback?.rating) {
      return res.status(400).json({ message: "Feedback already submitted" });
    }

    if (!sessionHasEnded(session)) {
      return res.status(400).json({
        message: "You can leave feedback after the session has ended",
      });
    }

    session.studentFeedback = {
      rating: r,
      comment: typeof comment === "string" ? comment.slice(0, 2000) : "",
      submittedAt: new Date(),
    };
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update session status (accept/reject)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // If accepting, check for time clashes with other accepted sessions
    if (status === "accepted") {
      const sessionTime = new Date(session.time);
      const sessionEnd = new Date(sessionTime.getTime() + (session.durationMinutes || 60) * 60 * 1000);

      // Find other accepted sessions for this tutor that might clash
      const conflictingSessions = await Session.find({
        tutorId: session.tutorId,
        status: "accepted",
        _id: { $ne: session._id }, // Exclude current session
        $or: [
          // New session starts during existing session
          {
            time: { $lte: sessionTime },
            $expr: {
              $gt: [
                { $add: ["$time", { $multiply: [{ $ifNull: ["$durationMinutes", 60] }, 60 * 1000] }] },
                sessionTime
              ]
            }
          },
          // New session ends during existing session
          {
            time: { $lt: sessionEnd },
            $expr: {
              $gte: [
                { $add: ["$time", { $multiply: [{ $ifNull: ["$durationMinutes", 60] }, 60 * 1000] }] },
                sessionEnd
              ]
            }
          },
          // Existing session is completely within new session
          {
            time: { $gte: sessionTime, $lt: sessionEnd }
          }
        ]
      });

      if (conflictingSessions.length > 0) {
        return res.status(400).json({
          message: "This session conflicts with another accepted session. Please choose a different time."
        });
      }
    }

    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updatedSession);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
