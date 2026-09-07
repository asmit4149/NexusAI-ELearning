import express from 'express';
import { generatePlan, getPlan, recalibratePlan } from '../controllers/plannerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate/:courseId', protect, generatePlan);
router.get('/:courseId', protect, getPlan);
router.patch('/:courseId/recalibrate', protect, recalibratePlan);

export default router;
