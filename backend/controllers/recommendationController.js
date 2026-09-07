import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import QuizAttempt from '../models/QuizAttempt.js';

// @desc    Get personalized course recommendations
// @route   GET /api/recommendations
// @access  Private (Student)
export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user's enrollments
    const enrollments = await Enrollment.find({ user: userId }).populate('course');
    
    // Separate into active and completed
    const activeEnrollments = enrollments.filter(e => e.progress < 100);
    const completedEnrollments = enrollments.filter(e => e.progress === 100);
    
    const enrolledCourseIds = enrollments.map(e => e.course._id.toString());
    const completedCourseIds = completedEnrollments.map(e => e.course._id.toString());
    
    // Get categories user has shown interest in
    const userCategories = [...new Set(enrollments.map(e => e.course.category))].filter(Boolean);

    // ==========================================
    // Section 1: Continue Learning
    // ==========================================
    const continueLearning = activeEnrollments.map(e => ({
      ...e.course.toObject(),
      progress: e.progress,
      lastAccessed: e.updatedAt
    })).sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed)).slice(0, 4);

    // ==========================================
    // Section 2: Next Course (Sequential / Level up)
    // ==========================================
    // For each completed course, recommend another course in the same category
    // that the user hasn't enrolled in, preferring higher difficulty if possible.
    let nextCourse = [];
    if (completedEnrollments.length > 0) {
      const difficultyMap = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
      
      const potentialNextCourses = await Course.find({
        category: { $in: userCategories },
        _id: { $nin: enrolledCourseIds }
      });

      // Simple heuristic: group by category, pick ones that user hasn't taken
      const recommendedNextIds = new Set();
      
      for (const comp of completedEnrollments) {
        const compDiffLevel = difficultyMap[comp.course.difficulty] || 1;
        const compCategory = comp.course.category;
        
        // Find a course in same category with same or higher difficulty
        const next = potentialNextCourses.find(c => 
          c.category === compCategory && 
          (difficultyMap[c.difficulty] || 1) >= compDiffLevel &&
          !recommendedNextIds.has(c._id.toString())
        );

        if (next) {
          nextCourse.push(next);
          recommendedNextIds.add(next._id.toString());
        }
      }
      
      nextCourse = nextCourse.slice(0, 4);
    }

    // ==========================================
    // Section 3: Improve Your Skills (Weak topics)
    // ==========================================
    // Analyze failed quizzes to find weak topics
    const quizAttempts = await QuizAttempt.find({ user: userId }).populate('quiz');
    
    // Calculate average score per topic/course
    const topicScores = {};
    quizAttempts.forEach(attempt => {
      if (!attempt.quiz) return;
      const topic = attempt.quiz.title;
      if (!topicScores[topic]) topicScores[topic] = { total: 0, count: 0 };
      topicScores[topic].total += attempt.score;
      topicScores[topic].count += 1;
    });

    const weakTopics = Object.keys(topicScores)
      .map(topic => ({ topic, avg: topicScores[topic].total / topicScores[topic].count }))
      .filter(t => t.avg < 80)
      .sort((a, b) => a.avg - b.avg) // Lowest scores first
      .map(t => t.topic);

    let improveSkills = [];
    if (weakTopics.length > 0) {
      // Find courses that contain the weak topic words in title or category, excluding enrolled ones
      const searchTerms = weakTopics.flatMap(t => t.split(' ')).filter(word => word.length > 3);
      
      if (searchTerms.length > 0) {
        const regexPattern = new RegExp(searchTerms.join('|'), 'i');
        improveSkills = await Course.find({
          _id: { $nin: enrolledCourseIds },
          $or: [
            { title: regexPattern },
            { category: regexPattern },
            { description: regexPattern }
          ]
        }).limit(4);
      }
    }

    // ==========================================
    // Section 4: Recommended for You
    // ==========================================
    // Courses in interested categories, highly rated or heavily enrolled, excluding everything already shown/enrolled
    const alreadyShownIds = [...enrolledCourseIds, ...nextCourse.map(c => c._id.toString()), ...improveSkills.map(c => c._id.toString())];
    
    let recommendedForYou = await Course.find({
      category: { $in: userCategories },
      _id: { $nin: alreadyShownIds }
    }).sort('-enrolledStudents').limit(4);

    if (recommendedForYou.length === 0) {
      recommendedForYou = await Course.find({
        _id: { $nin: alreadyShownIds }
      }).sort('-enrolledStudents').limit(4);
    }

    res.status(200).json({
      success: true,
      data: {
        continueLearning,
        nextCourse,
        improveSkills,
        recommendedForYou
      }
    });

  } catch (error) {
    next(error);
  }
};
