import express from 'express';
import {
  generateAndCreateQuiz,
  getQuizzesByCourse,
  getQuizById,
  submitQuiz,
  getQuizHistory,
  publishQuiz,
  updateQuiz,
  deleteQuiz,
  getMyDraftQuizzes,
} from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Personal quiz history (must be before /:id)
router.get('/history', protect, getQuizHistory);

// Instructor: get all draft quizzes
router.get('/drafts', protect, authorize('Instructor', 'Admin'), getMyDraftQuizzes);

// Generate an AI Quiz (saved as Draft)
router.post('/generate/:courseId', protect, authorize('Instructor', 'Admin'), generateAndCreateQuiz);

// Get all quizzes for a specific course
router.get('/course/:courseId', protect, getQuizzesByCourse);

// CRUD on a specific quiz
router.get('/:id', protect, getQuizById);
router.put('/:id', protect, authorize('Instructor', 'Admin'), updateQuiz);
router.delete('/:id', protect, authorize('Instructor', 'Admin'), deleteQuiz);

// Publish a draft quiz
router.patch('/:id/publish', protect, authorize('Instructor', 'Admin'), publishQuiz);

// Submit quiz answers (students)
router.post('/:id/submit', protect, submitQuiz);

export default router;
