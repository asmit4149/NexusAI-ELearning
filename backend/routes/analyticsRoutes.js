import express from 'express';
import { getStudentAnalytics, getInstructorAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/student', protect, getStudentAnalytics);
router.get('/instructor', protect, authorize('Instructor', 'Admin'), getInstructorAnalytics);

export default router;
