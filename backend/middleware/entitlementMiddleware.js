import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

export const requireEntitlement = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // Assume courseId is in params or body
    const courseId = req.params.courseId || req.params.id || req.body.courseId;

    if (!courseId) {
      res.status(400);
      throw new Error('Course ID is required');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (course.accessType === 'free') {
      return next();
    }

    // Check direct enrollment
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (enrollment && enrollment.status === 'Active') {
      return next();
    }

    // Check active subscription
    if (course.accessType === 'premium') {
      if (req.user.subscriptionStatus === 'active') {
        return next();
      }
    }

    res.status(403);
    throw new Error('You do not have access to this course. Please subscribe or purchase it.');
  } catch (error) {
    next(error);
  }
};
