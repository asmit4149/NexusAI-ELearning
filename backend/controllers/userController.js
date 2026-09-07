import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Get top users by points (Leaderboard)
// @route   GET /api/users/leaderboard
// @access  Public
export const getLeaderboard = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const topUsers = await User.find({ role: 'Student' })
      .sort({ points: -1 }) // Descending order
      .limit(limit)
      .select('name avatar points badges'); // Only return safe public info

    res.status(200).json({
      success: true,
      message: 'Leaderboard fetched successfully',
      data: topUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get courses the currently logged-in student is enrolled in
// @route   GET /api/users/my-enrollments
// @access  Private (Student)
export const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate({
        path: 'course',
        select: 'title description category level thumbnail rating',
        populate: { path: 'instructor', select: 'name avatar' }
      })
      .sort('-createdAt');

    const courses = enrollments.map(e => e.course).filter(Boolean);

    res.status(200).json({
      success: true,
      message: 'Enrollments fetched successfully',
      data: courses
    });
  } catch (error) {
    next(error);
  }
};
