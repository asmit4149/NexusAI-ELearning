import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { awardXP } from '../services/gamificationService.js';
import Certificate from '../models/Certificate.js';
import crypto from 'crypto';

// ========================
// COURSE CONTROLLER
// ========================

// @desc    Create a course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
export const createCourse = async (req, res, next) => {
  try {
    req.body.instructor = req.user._id;

    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses with pagination, search, filter
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res, next) => {
  try {
    const { title, category, level, page = 1, limit = 10 } = req.query;

    let query = {};

    // Search by title (regex)
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    // Exact match filters
    if (category) query.category = category;
    if (level) query.level = level;

    const skip = (Number(page) - 1) * Number(limit);

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar email')
      .skip(skip)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Courses fetched successfully',
      data: {
        courses,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar email')
      .populate('lessons');

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    res.status(200).json({
      success: true,
      message: 'Course fetched successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended courses based on user's enrollments
// @route   GET /api/courses/recommendations
// @access  Private (Student)
export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all user enrollments
    const enrollments = await Enrollment.find({ user: userId }).populate('course');
    
    if (!enrollments || enrollments.length === 0) {
      // If no enrollments, return top rated courses
      const topCourses = await Course.find()
        .sort('-rating -totalReviews')
        .limit(5);
        
      return res.status(200).json({
        success: true,
        message: 'Top rated courses fetched (no prior enrollments)',
        data: topCourses
      });
    }

    // Extract unique categories from enrolled courses
    const enrolledCategories = [...new Set(enrollments.map(e => e.course.category))];
    const enrolledCourseIds = enrollments.map(e => e.course._id);

    // Find other courses in those categories that the user is NOT enrolled in
    const recommendations = await Course.find({
      category: { $in: enrolledCategories },
      _id: { $nin: enrolledCourseIds }
    })
    .sort('-rating')
    .limit(5);

    res.status(200).json({
      success: true,
      message: 'Recommendations fetched successfully',
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
export const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Ensure user is course owner or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to update this course');
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Ensure user is course owner or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to delete this course');
    }

    // Cascade delete lessons
    await Lesson.deleteMany({ course: course._id });
    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// LESSON CONTROLLER
// ========================

// @desc    Add a lesson to course
// @route   POST /api/courses/:courseId/lessons
// @access  Private (Instructor/Admin)
export const addLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to add lessons to this course');
    }

    const lesson = await Lesson.create({
      ...req.body,
      course: course._id,
    });

    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lessons of a course
// @route   GET /api/courses/:courseId/lessons
// @access  Public
export const getLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId }).sort('order');
    
    res.status(200).json({
      success: true,
      message: 'Lessons fetched successfully',
      data: lessons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:lessonId
// @access  Private (Instructor/Admin)
export const updateLesson = async (req, res, next) => {
  try {
    let lesson = await Lesson.findById(req.params.lessonId).populate('course');

    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    if (lesson.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to update this lesson');
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.lessonId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:lessonId
// @access  Private (Instructor/Admin)
export const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId).populate('course');

    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    if (lesson.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to delete this lesson');
    }

    // Remove lesson from course array
    const course = await Course.findById(lesson.course._id);
    course.lessons = course.lessons.filter(l => l.toString() !== lesson._id.toString());
    await course.save();

    await lesson.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// ENROLLMENT & PROGRESS
// ========================

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
export const enrollInCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
      res.status(400);
      throw new Error('You are already enrolled in this course');
    }

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      status: 'Active',
      progress: 0
    });

    course.enrolledStudents.push(userId);
    await course.save();

    // Award XP for enrollment (fire-and-forget)
    awardXP(userId, 'COURSE_ENROLL').catch(err => console.error('Enroll XP error:', err));

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course progress
// @route   PUT /api/courses/:id/progress
// @access  Private (Student)
export const updateCourseProgress = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;
    const { progress } = req.body;

    if (progress === undefined || progress < 0 || progress > 100) {
      res.status(400);
      throw new Error('Please provide a valid progress value between 0 and 100');
    }

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    
    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found for this course');
    }

    enrollment.progress = progress;
    
    if (progress === 100 && enrollment.status !== 'Completed') {
      enrollment.status = 'Completed';
      enrollment.completedAt = Date.now();
      
      // Award XP for course completion via centralized gamification service
      awardXP(userId, 'COURSE_COMPLETE').catch(err => console.error('Course complete XP error:', err));

      // Generate Certificate
      const existingCert = await Certificate.findOne({ user: userId, course: courseId });
      if (!existingCert) {
        await Certificate.create({
          user: userId,
          course: courseId,
          credentialId: crypto.randomBytes(8).toString('hex').toUpperCase(),
          certificateUrl: 'Generated PDF', // This will be generated dynamically on download
        });
      }
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Course progress updated successfully',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get courses created by the logged-in instructor
// @route   GET /api/courses/my-courses
// @access  Private (Instructor/Admin)
export const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};
