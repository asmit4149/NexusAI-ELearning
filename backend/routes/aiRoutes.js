import express from 'express';
import { chatWithAITutor, getChatHistory, getLearningCoachAdvice, generateCodeHint } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, chatWithAITutor);
router.get('/chat/:courseId/history', protect, getChatHistory);
router.get('/coach', protect, getLearningCoachAdvice);
router.post('/code-hint', protect, generateCodeHint);

export default router;
