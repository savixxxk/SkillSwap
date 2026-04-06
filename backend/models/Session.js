// models/Session.js
import mongoose from "mongoose";

const studentFeedbackSchema = new mongoose.Schema(
  {
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentName: { type: String, required: true },
  tutorName: { type: String, required: true },
  subject: { type: String, required: true },
  time: { type: Date, required: true },
  /** Default session length; student can leave feedback after this window from `time`. */
  durationMinutes: { type: Number, default: 60 },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  studentFeedback: { type: studentFeedbackSchema, default: undefined },
});

export default mongoose.model("Session", sessionSchema);
