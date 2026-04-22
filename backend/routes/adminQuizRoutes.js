import express from 'express';
const router = express.Router();
import { createQuiz, getAllQuizzes, updateQuiz, deleteQuiz } from '../controllers/quizController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

router.post('/quizzes', requireAuth, requireAdmin, createQuiz);
router.get('/quizzes', requireAuth, requireAdmin, getAllQuizzes);
router.put('/quizzes/:quizId', requireAuth, requireAdmin, updateQuiz);
router.delete('/quizzes/:quizId', requireAuth, requireAdmin, deleteQuiz);

export default router;