import express from 'express';
import { createChallenge, getChallenges, getChallengeDetails, submitCode } from '../controllers/codeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/challenge', protect, authorize('Instructor', 'Admin'), createChallenge);
router.get('/course/:courseId', protect, getChallenges);
router.get('/challenge/:id', protect, getChallengeDetails);
router.post('/submit/:challengeId', protect, submitCode);

export default router;
