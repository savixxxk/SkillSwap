import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  isPassed: { type: Boolean, required: true },
  attemptedAt: { type: Date, default: Date.now },
  nextAttemptAllowedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('QuizAttempt', quizAttemptSchema);