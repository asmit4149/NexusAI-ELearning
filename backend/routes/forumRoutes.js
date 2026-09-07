import express from 'express';
import { createThread, getThreads } from '../controllers/forumController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getThreads)
  .post(protect, createThread);

export default router;
