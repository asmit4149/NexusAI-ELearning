import Review from '../models/Review.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Add review
// @route   POST /api/courses/:courseId/reviews
// @access  Private (Student only)
export const addReview = async (req, res, next) => {
  try {
    req.body.course = req.params.courseId;
    req.body.user = req.user._id;

    // Check if course exists
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Must be enrolled to review
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });
    if (!enrollment) {
      res.status(403);
      throw new Error('You must be enrolled in the course to leave a review');
    }

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review
    });
  } catch (error) {
    // Catch duplicate key error (MongoDB error code 11000)
    if (error.code === 11000) {
      res.status(400);
      return next(new Error('You have already reviewed this course'));
    }
    next(error);
  }
};

// @desc    Get reviews for a course
// @route   GET /api/courses/:courseId/reviews
// @access  Public
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('user', 'name avatar badges')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      message: 'Reviews fetched successfully',
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};
