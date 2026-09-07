import StudyPlan from '../models/StudyPlan.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import { generateStudyPlan } from '../services/nvidiaService.js';

// @desc    Generate a new AI Study Plan
// @route   POST /api/planner/generate/:courseId
// @access  Private
export const generatePlan = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { weeklyHours, targetDate } = req.body;
    const userId = req.user._id;

    if (!weeklyHours || !targetDate) {
      res.status(400);
      throw new Error('Please provide weeklyHours and targetDate');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) {
      res.status(403);
      throw new Error('You must be enrolled in this course to generate a study plan');
    }

    // Fetch all lessons ordered
    const allLessons = await Lesson.find({ course: courseId }).sort('order');
    
    // Estimate pending lessons based on progress %
    const progressIndex = Math.floor((enrollment.progress / 100) * allLessons.length);
    const pendingLessons = allLessons.slice(progressIndex);

    // Fetch published quizzes
    const quizzes = await Quiz.find({ course: courseId, status: 'Published' }).select('_id title timeLimit');

    // Generate schedule via Gemini
    const schedule = await generateStudyPlan({
      courseTitle: course.title,
      weeklyHours: Number(weeklyHours),
      targetDate,
      pendingLessons,
      quizzes
    });

    // Delete existing plan if any
    await StudyPlan.findOneAndDelete({ user: userId, course: courseId });

    // Save new plan
    const studyPlan = await StudyPlan.create({
      user: userId,
      course: courseId,
      weeklyHours: Number(weeklyHours),
      targetDate,
      schedule
    });

    res.status(201).json({
      success: true,
      message: 'Study plan generated successfully',
      data: studyPlan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active study plan for a course
// @route   GET /api/planner/:courseId
// @access  Private
export const getPlan = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const plan = await StudyPlan.findOne({ user: userId, course: courseId });
    
    res.status(200).json({
      success: true,
      data: plan || null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Recalculate plan (re-generate based on current progress)
// @route   PATCH /api/planner/:courseId/recalibrate
// @access  Private
export const recalibratePlan = async (req, res, next) => {
  // Essentially calling generatePlan again with existing parameters
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const existingPlan = await StudyPlan.findOne({ user: userId, course: courseId });
    if (!existingPlan) {
      res.status(404);
      throw new Error('No study plan found to recalibrate');
    }

    // Reuse existing params
    req.body.weeklyHours = existingPlan.weeklyHours;
    req.body.targetDate = existingPlan.targetDate;

    return generatePlan(req, res, next);
  } catch (error) {
    next(error);
  }
};
