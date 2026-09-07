import QuizAttempt from '../models/QuizAttempt.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';

// ============================================================
// Adaptive Learning Analysis Engine
// ============================================================

// @desc    Get personalized learning path for the logged-in student
// @route   GET /api/adaptive/learning-path
// @access  Private (Student)
export const getLearningPath = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all enrollments with course data
    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: 'course',
        select: 'title category level lessons rating',
      })
      .sort('-updatedAt');

    if (!enrollments || enrollments.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No enrollments found. Enroll in a course to get your personalized learning path.',
        data: { weakTopics: [], nextLessons: [], performanceSummary: [], recommendedDifficulty: 'Beginner' }
      });
    }

    // 2. Fetch all quiz attempts for this user (with quiz details)
    const allAttempts = await QuizAttempt.find({ user: userId })
      .populate({
        path: 'quiz',
        select: 'title difficulty course passingScore',
      })
      .sort('-createdAt');

    // 3. Build Performance Summary per course
    const performanceSummary = [];
    const weakTopics = [];
    const nextLessons = [];

    for (const enrollment of enrollments) {
      const course = enrollment.course;
      if (!course) continue;

      // Quiz performance for this course
      const courseAttempts = allAttempts.filter(
        a => a.quiz && a.quiz.course && a.quiz.course.toString() === course._id.toString()
      );

      // Calculate wrong answers analysis
      let totalCorrect = 0;
      let totalAnswers = 0;
      let failedQuizzes = [];
      let avgScore = null;

      if (courseAttempts.length > 0) {
        courseAttempts.forEach(attempt => {
          attempt.answers.forEach(ans => {
            totalAnswers++;
            if (ans.isCorrect) totalCorrect++;
          });
          if (!attempt.isPassed) {
            failedQuizzes.push(attempt.quiz?.title || 'Unknown Quiz');
          }
        });

        const totalScores = courseAttempts.reduce((sum, a) => sum + a.score, 0);
        avgScore = Math.round(totalScores / courseAttempts.length);
        const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : null;

        // Identify weak topics (failed quizzes or low scores)
        const lowScoringAttempts = courseAttempts.filter(a => a.score < 60);
        lowScoringAttempts.forEach(attempt => {
          if (attempt.quiz?.title) {
            weakTopics.push({
              courseTitle: course.title,
              topic: attempt.quiz.title,
              score: Math.round(attempt.score),
              difficulty: attempt.quiz.difficulty,
              suggestion: `Revisit the material covered in "${attempt.quiz.title}" and retry the quiz.`
            });
          }
        });

        performanceSummary.push({
          courseId: course._id,
          courseTitle: course.title,
          courseCategory: course.category,
          progress: enrollment.progress,
          status: enrollment.status,
          avgQuizScore: avgScore,
          accuracy: accuracy,
          totalAttempts: courseAttempts.length,
          failedQuizzes,
          level: course.level,
        });
      } else {
        performanceSummary.push({
          courseId: course._id,
          courseTitle: course.title,
          courseCategory: course.category,
          progress: enrollment.progress,
          status: enrollment.status,
          avgQuizScore: null,
          accuracy: null,
          totalAttempts: 0,
          failedQuizzes: [],
          level: course.level,
        });
      }

      // 4. Identify next lesson based on progress
      if (enrollment.status === 'Active' && course.lessons && course.lessons.length > 0) {
        const lessons = await Lesson.find({ course: course._id }).sort('order');
        if (lessons.length > 0) {
          // Estimate which lesson the student is on based on % progress
          const progressIndex = Math.floor((enrollment.progress / 100) * lessons.length);
          const nextLesson = lessons[progressIndex] || lessons[lessons.length - 1];

          nextLessons.push({
            courseId: course._id,
            courseTitle: course.title,
            lessonId: nextLesson._id,
            lessonTitle: nextLesson.title,
            lessonDescription: nextLesson.description,
            lessonOrder: nextLesson.order,
            progress: enrollment.progress,
          });
        }
      }
    }

    // 5. Recommend difficulty level based on overall quiz performance
    const gradedCourses = performanceSummary.filter(p => p.avgQuizScore !== null);
    let recommendedDifficulty = 'Beginner';
    if (gradedCourses.length > 0) {
      const overallAvg = gradedCourses.reduce((sum, c) => sum + c.avgQuizScore, 0) / gradedCourses.length;
      if (overallAvg >= 85) recommendedDifficulty = 'Advanced';
      else if (overallAvg >= 65) recommendedDifficulty = 'Intermediate';
      else recommendedDifficulty = 'Beginner';
    }

    // 6. Deduplicate weak topics, keep only worst per course
    const uniqueWeak = [];
    const seenCourses = new Set();
    weakTopics.sort((a, b) => a.score - b.score).forEach(w => {
      if (!seenCourses.has(w.courseTitle)) {
        uniqueWeak.push(w);
        seenCourses.add(w.courseTitle);
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Learning path generated successfully',
      data: {
        performanceSummary,
        weakTopics: uniqueWeak,
        nextLessons,
        recommendedDifficulty,
      }
    });
  } catch (error) {
    next(error);
  }
};
