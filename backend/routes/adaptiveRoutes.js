import express from 'express';
import { getLearningPath } from '../controllers/adaptiveController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/adaptive/learning-path
router.get('/learning-path', protect, getLearningPath);

export default router;
