import express from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addLesson,
  getLessons,
  updateLesson,
  deleteLesson,
  enrollInCourse,
  updateCourseProgress,
  getRecommendations,
  getMyCourses
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import reviewRouter from './reviewRoutes.js';
import forumRouter from './forumRoutes.js';

const router = express.Router();

// ========================
// COURSE ROUTES
// ========================
router.route('/')
  .post(protect, authorize('Instructor', 'Admin'), createCourse)
  .get(getCourses);

router.get('/recommendations', protect, getRecommendations);
router.get('/my-courses', protect, authorize('Instructor', 'Admin'), getMyCourses);

router.route('/:id')
  .get(getCourseById)
  .put(protect, authorize('Instructor', 'Admin'), updateCourse)
  .delete(protect, authorize('Instructor', 'Admin'), deleteCourse);

// ========================
// REVIEW ROUTES (Nested)
// ========================
router.use('/:courseId/reviews', reviewRouter);

// ========================
// FORUM ROUTES (Nested)
// ========================
router.use('/:courseId/forum', forumRouter);

// ========================
// ENROLLMENT ROUTES
// ========================
router.post('/:id/enroll', protect, enrollInCourse);
router.put('/:id/progress', protect, updateCourseProgress);

// ========================
// LESSON ROUTES
// ========================
// Create and Get lessons tied to a specific course
router.route('/:courseId/lessons')
  .post(protect, authorize('Instructor', 'Admin'), addLesson)
  .get(getLessons);

// Update and Delete specific lessons
// Note: Mounted here, the actual endpoint will be /api/courses/lessons/:lessonId
router.route('/lessons/:lessonId')
  .put(protect, authorize('Instructor', 'Admin'), updateLesson)
  .delete(protect, authorize('Instructor', 'Admin'), deleteLesson);

export default router;
