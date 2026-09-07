import express from 'express';
import { getPlans, createSubscription, getMySubscription } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/plans', getPlans);
router.post('/', protect, createSubscription);
router.get('/me', protect, getMySubscription);

export default router;
