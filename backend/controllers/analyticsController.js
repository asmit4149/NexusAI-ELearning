import Enrollment from '../models/Enrollment.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Course from '../models/Course.js';
import mongoose from 'mongoose';

// @desc    Get advanced learning analytics for a student
// @route   GET /api/analytics/student
// @access  Private (Student)
export const getStudentAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Progress: Active vs Completed courses
    const enrollments = await Enrollment.find({ user: userId }).populate('course', 'title');
    const totalEnrolled = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === 'Completed').length;
    const activeCourses = totalEnrolled - completedCourses;
    const avgProgress = totalEnrolled > 0 
      ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / totalEnrolled) 
      : 0;

    // 2. Quiz Analytics
    const quizAttempts = await QuizAttempt.find({ user: userId }).populate({
      path: 'quiz',
      populate: { path: 'course', select: 'title category' }
    });
    
    const totalQuizzes = quizAttempts.length;
    const passedQuizzes = quizAttempts.filter(q => q.isPassed).length;
    const avgQuizScore = totalQuizzes > 0 
      ? Math.round(quizAttempts.reduce((acc, curr) => acc + curr.score, 0) / totalQuizzes) 
      : 0;

    // Strong / Weak Topics (grouped by course category or course title)
    const topicScores = {};
    quizAttempts.forEach(attempt => {
      const topic = attempt.quiz?.course?.category || 'General';
      if (!topicScores[topic]) {
        topicScores[topic] = { totalScore: 0, count: 0 };
      }
      topicScores[topic].totalScore += attempt.score;
      topicScores[topic].count += 1;
    });

    const topics = Object.keys(topicScores).map(topic => ({
      name: topic,
      avgScore: Math.round(topicScores[topic].totalScore / topicScores[topic].count)
    }));

    const strongTopics = topics.filter(t => t.avgScore >= 70).sort((a, b) => b.avgScore - a.avgScore);
    const weakTopics = topics.filter(t => t.avgScore < 70).sort((a, b) => a.avgScore - b.avgScore);

    // 3. Weekly Activity (Activity over the last 7 days)
    // We'll approximate activity based on QuizAttempts timestamps
    const activityTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., 'Mon'
      
      const startOfDay = new Date(d.setHours(0,0,0,0));
      const endOfDay = new Date(d.setHours(23,59,59,999));
      
      const activityCount = quizAttempts.filter(q => 
        new Date(q.createdAt) >= startOfDay && new Date(q.createdAt) <= endOfDay
      ).length;

      // add mock baseline to make chart look alive even if 0, but use real data
      activityTrend.push({ name: dateStr, score: activityCount * 10 }); 
    }

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEnrolled,
          completedCourses,
          activeCourses,
          avgProgress,
        },
        quizStats: {
          totalQuizzes,
          passedQuizzes,
          avgQuizScore,
        },
        strongTopics,
        weakTopics,
        activityTrend,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course performance analytics for an instructor
// @route   GET /api/analytics/instructor
// @access  Private (Instructor/Admin)
export const getInstructorAnalytics = async (req, res, next) => {
  try {
    const instructorId = req.user._id;

    // 1. Fetch instructor's courses
    const courses = await Course.find({ instructor: instructorId });
    const courseIds = courses.map(c => c._id);

    // 2. Aggregate Enrollments for these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } }).populate('course', 'title');
    
    const totalStudents = enrollments.length;
    const completedCount = enrollments.filter(e => e.status === 'Completed').length;
    const overallCompletionRate = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

    // 3. Aggregate Quiz Attempts for these courses
    const quizAttempts = await QuizAttempt.find().populate({
      path: 'quiz',
      match: { course: { $in: courseIds } },
      select: 'title course'
    });
    
    // Filter out attempts where quiz didn't match (due to population match filtering)
    const validAttempts = quizAttempts.filter(a => a.quiz !== null);
    
    const totalQuizAttempts = validAttempts.length;
    const avgScoreOverall = totalQuizAttempts > 0 
      ? Math.round(validAttempts.reduce((sum, a) => sum + a.score, 0) / totalQuizAttempts)
      : 0;

    // Difficult Lessons (Quizzes with lowest average scores)
    const quizStats = {};
    validAttempts.forEach(attempt => {
      const qId = attempt.quiz._id.toString();
      if (!quizStats[qId]) {
        quizStats[qId] = { title: attempt.quiz.title, totalScore: 0, count: 0 };
      }
      quizStats[qId].totalScore += attempt.score;
      quizStats[qId].count += 1;
    });

    const difficultLessons = Object.keys(quizStats)
      .map(qId => ({
        quizTitle: quizStats[qId].title,
        avgScore: Math.round(quizStats[qId].totalScore / quizStats[qId].count),
        attempts: quizStats[qId].count
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5); // Bottom 5

    // Course specific breakdown
    const courseBreakdown = courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.course?._id.toString() === course._id.toString());
      const cTotal = courseEnrollments.length;
      const cCompleted = courseEnrollments.filter(e => e.status === 'Completed').length;
      
      const cAttempts = validAttempts.filter(a => a.quiz.course.toString() === course._id.toString());
      const cAvgScore = cAttempts.length > 0 
        ? Math.round(cAttempts.reduce((sum, a) => sum + a.score, 0) / cAttempts.length)
        : 0;

      return {
        id: course._id,
        title: course.title,
        students: cTotal,
        completionRate: cTotal > 0 ? Math.round((cCompleted / cTotal) * 100) : 0,
        avgQuizScore: cAvgScore,
        revenue: course.price * cTotal // Rough estimate
      };
    });

    // Trend: New enrollments over last 7 days
    const enrollmentTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const startOfDay = new Date(d.setHours(0,0,0,0));
      const endOfDay = new Date(d.setHours(23,59,59,999));
      
      const count = enrollments.filter(e => 
        new Date(e.createdAt) >= startOfDay && new Date(e.createdAt) <= endOfDay
      ).length;

      enrollmentTrend.push({ date: dateStr, enrollments: count });
    }

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalStudents,
          overallCompletionRate,
          avgScoreOverall,
          totalCourses: courses.length
        },
        difficultLessons,
        courseBreakdown,
        enrollmentTrend
      }
    });
  } catch (error) {
    next(error);
  }
};
