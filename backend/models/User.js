import mongoose from "mongoose";

const examAttemptSchema = new mongoose.Schema(
  {
    subjectId: { type: String, required: true },
    percent: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    attemptedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);
//tutor
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "tutor", "admin"], required: true },
    isBlocked: { type: Boolean, default: false },
    certifiedTutor: { type: Boolean, default: false },
    bio: { type: String, default: "" },
    profilePic: { type: String, default: "/images/profile.jpg" },
    teachingSubjects: { type: [String], default: [] },
    certifiedSubjects: { type: [String], default: [] },
    examAttempts: { type: [examAttemptSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
