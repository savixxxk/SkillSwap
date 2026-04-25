import express from 'express';
const router = express.Router();
import { getQuizzes, getRandomQuiz, attemptQuiz } from '../controllers/quizController.js';
import { requireAuth } from '../middleware/auth.js';

router.get('/quizzes', requireAuth, getQuizzes);
router.get('/quizzes/:subject', requireAuth, getRandomQuiz);
router.post('/attempt/:quizId', requireAuth, attemptQuiz);

export default router;