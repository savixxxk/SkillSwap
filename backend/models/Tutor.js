const mongoose = require('mongoose');


const tutorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjects: {
    type: [String],
    required: true
  },
  level: {
    type: [String],
    required: true 
    // e.g., O/L, A/L, Undergraduate, Postgraduate, Professional
  },
  availability: [
    {
      day: { type: String, required: true },
      timeSlots: [String]
    }
  ],
  deliveryMode: {
    type: String,
    enum: ['Online', 'In-Person', 'Both'],
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tutor', tutorSchema);
