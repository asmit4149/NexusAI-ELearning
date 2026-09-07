import express from 'express';
import { getMyEnrollments } from '../controllers/userController.js';
import { getLeaderboard, getGamificationProfile, getWeeklyChallenges } from '../controllers/gamificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Leaderboard (upgraded - sorted by XP with levels)
router.get('/leaderboard', getLeaderboard);

// Enrollments
router.get('/my-enrollments', protect, getMyEnrollments);

// Gamification
router.get('/me/gamification', protect, getGamificationProfile);
router.get('/weekly-challenges', protect, getWeeklyChallenges);

export default router;
