const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: { type: String, enum: ["student", "tutor"], default: "student" },

  bio: String,
  profilePic: String,

  subjects: [String],

  sessionsHeld: { type: Number, default: 0 },
  ratings: [Number]
});

module.exports = mongoose.model("User", userSchema);