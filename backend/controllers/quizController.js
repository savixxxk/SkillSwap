import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';

const createQuiz = async (req, res) => {
  try {
    const { title, subject, questions, passMark } = req.body;
    const createdBy = req.userId;
    if (!createdBy) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const quiz = new Quiz({
      title,
      subject,
      questions,
      passMark,
      createdBy
    });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, subject, passMark } = req.body;
    const updates = {};

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ message: 'Title is required' });
      }
      updates.title = String(title).trim();
    }
    if (subject !== undefined) {
      if (!String(subject).trim()) {
        return res.status(400).json({ message: 'Subject is required' });
      }
      updates.subject = String(subject).trim();
    }
    if (passMark !== undefined) {
      const mark = Number(passMark);
      if (Number.isNaN(mark) || mark < 0 || mark > 100) {
        return res.status(400).json({ message: 'Pass mark must be between 0 and 100' });
      }
      updates.passMark = mark;
    }

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate('createdBy', 'name email');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findByIdAndDelete(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    await QuizAttempt.deleteMany({ quizId });
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    
    // If no quizzes exist, return empty array with proper structure
    if (quizzes.length === 0) {
      return res.json([]);
    }
    
    const subjects = [...new Set(quizzes.map(q => q.subject))];
    const quizzesBySubject = subjects.map(subject => ({
      subject,
      quizzes: quizzes.filter(q => q.subject === subject).map(q => ({ id: q._id, title: q.title }))
    }));
    res.json(quizzesBySubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRandomQuiz = async (req, res) => {
  try {
    const { subject } = req.params;
    const quizzes = await Quiz.find({ subject });
    if (quizzes.length === 0) return res.status(404).json({ message: 'No quizzes for this subject' });

    // Check if already certified
    const tutorId = req.user.id;
    const passedAttempts = await QuizAttempt.find({ tutorId, isPassed: true });
    const passedQuizIds = passedAttempts.map(a => a.quizId.toString());
    const passedSubjects = await Quiz.find({ _id: { $in: passedQuizIds } }).distinct('subject');
    if (passedSubjects.includes(subject)) {
      return res.status(400).json({ message: 'You are already certified for this subject.' });
    }

    // Check if blocked
    const lastAttempt = await QuizAttempt.findOne({ tutorId, quizId: { $in: quizzes.map(q => q._id) } }).sort({ attemptedAt: -1 });
    if (lastAttempt && !lastAttempt.isPassed && new Date() < lastAttempt.nextAttemptAllowedAt) {
      return res.status(403).json({ message: 'You must wait 24 hours before retrying.' });
    }

    const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    res.json(randomQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const attemptQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const tutorId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const score = (correct / quiz.questions.length) * 100;
    const isPassed = score >= quiz.passMark;

    const attempt = new QuizAttempt({
      tutorId,
      quizId,
      score,
      isPassed,
      nextAttemptAllowedAt: isPassed ? null : new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await attempt.save();

    if (isPassed) {
      // Keep legacy certifiedSubjects and dashboard gate flag in sync.
      await User.findByIdAndUpdate(tutorId, {
        $addToSet: { certifiedSubjects: quiz.subject },
        $set: { certifiedTutor: true }
      });
    }

    res.json({ score, isPassed, nextAttemptAllowedAt: attempt.nextAttemptAllowedAt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createQuiz,
  getAllQuizzes,
  updateQuiz,
  deleteQuiz,
  getQuizzes,
  getRandomQuiz,
  attemptQuiz,
};