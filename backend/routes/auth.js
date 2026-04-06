// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import {
  TUTOR_EXAM_SUBJECTS,
  isValidSubjectId,
  sanitizeQuestions,
  scoreAnswers,
  PASS_PERCENT,
} from "../data/tutorExam.js";

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "1d" }
  );
}

function toPublicUser(userDoc) {
  const o =
    userDoc?.toObject?.() ?? userDoc?._doc ?? userDoc;
  const { password: _p, ...userData } = o;
  return userData;
}

function passedSubjectIds(user) {
  const set = new Set();
  for (const a of user.examAttempts || []) {
    if (a.passed) set.add(a.subjectId);
  }
  return set;
}

function recomputeCertifiedTutor(user) {
  const subjects = user.teachingSubjects || [];
  if (subjects.length === 0) {
    user.certifiedTutor = false;
    return;
  }
  const passed = passedSubjectIds(user);
  user.certifiedTutor = subjects.every((id) => passed.has(id));
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["student", "tutor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      certifiedTutor: false,
      teachingSubjects: [],
      examAttempts: [],
    });
    await newUser.save();

    const token = signToken(newUser);
    res.status(201).json({
      message: "User registered successfully",
      user: toPublicUser(newUser),
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /auth/login — returns a token for valid credentials. Uncertified tutors
// use the same login; the app redirects them to finish certification before full access.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = signToken(user);
    res.status(200).json({ user: toPublicUser(user), token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /auth/tutor/exam/subjects
router.get("/tutor/exam/subjects", (req, res) => {
  res.json({ subjects: TUTOR_EXAM_SUBJECTS, passPercent: PASS_PERCENT });
});

// PUT /auth/tutor/teaching-subjects
router.put("/tutor/teaching-subjects", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "tutor") {
      return res.status(403).json({ message: "Only tutors can set subjects" });
    }
    if (user.certifiedTutor) {
      return res
        .status(403)
        .json({ message: "Certified tutors cannot change exam subjects here" });
    }

    const { subjectIds } = req.body;
    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Select at least one subject to teach" });
    }

    const unique = [...new Set(subjectIds.map(String))];
    for (const id of unique) {
      if (!isValidSubjectId(id)) {
        return res.status(400).json({ message: `Unknown subject: ${id}` });
      }
    }

    user.teachingSubjects = unique;
    recomputeCertifiedTutor(user);
    await user.save();

    res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /auth/tutor/exam/:subjectId/questions
router.get("/tutor/exam/:subjectId/questions", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "tutor" || user.certifiedTutor) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { subjectId } = req.params;
    if (!user.teachingSubjects?.includes(subjectId)) {
      return res.status(403).json({
        message: "This subject is not in your teaching selection",
      });
    }

    const questions = sanitizeQuestions(subjectId);
    if (!questions) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({ subjectId, questions, passPercent: PASS_PERCENT });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /auth/tutor/exam/submit
router.post("/tutor/exam/submit", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "tutor" || user.certifiedTutor) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { subjectId, answers } = req.body;
    if (!subjectId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "subjectId and answers required" });
    }

    if (!user.teachingSubjects?.includes(subjectId)) {
      return res.status(403).json({
        message: "This subject is not in your teaching selection",
      });
    }

    const result = scoreAnswers(subjectId, answers);
    if (result.error) {
      return res.status(400).json({ message: "Invalid answers payload" });
    }

    user.examAttempts.push({
      subjectId,
      percent: result.percent,
      passed: result.passed,
    });
    recomputeCertifiedTutor(user);
    await user.save();

    res.json({
      correct: result.correct,
      total: result.total,
      percent: result.percent,
      passed: result.passed,
      passPercent: PASS_PERCENT,
      certifiedTutor: user.certifiedTutor,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /auth/me — refresh user from token (e.g. after certification)
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /auth/profile — update bio (tutors / students)
router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const { bio } = req.body;
    if (bio !== undefined && typeof bio !== "string") {
      return res.status(400).json({ message: "Bio must be text" });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (bio !== undefined) {
      user.bio = bio.slice(0, 2000);
    }
    await user.save();
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
