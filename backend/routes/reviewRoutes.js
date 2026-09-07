import express from 'express';
import { addReview, getReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

// Merge params to access courseId from the parent router
const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getReviews)
  .post(protect, addReview);

export default router;
