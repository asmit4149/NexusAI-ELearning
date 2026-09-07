import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Course from '../models/Course.js';
import { generateQuizContent, generateQuestions } from '../services/nvidiaService.js';
import { awardXP } from '../services/gamificationService.js';

// @desc    Generate an AI Quiz (saves as DRAFT for review)
// @route   POST /api/quizzes/generate/:courseId
// @access  Private (Instructor/Admin)
export const generateAndCreateQuiz = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      difficulty = 'Medium',
      timeLimit = 15,
      numQuestions = 5,
      questionType = 'MCQ',
      customTopic
    } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    const topic = customTopic || course.title;

    // Generate questions via Gemini
    const generatedQuestions = await generateQuestions({ topic, difficulty, numQuestions, questionType });

    // Save as DRAFT for instructor review before publishing
    const quiz = await Quiz.create({
      course: courseId,
      title: title || `${topic} - ${difficulty} Quiz`,
      difficulty,
      questionType,
      timeLimit,
      passingScore: 80,
      questions: generatedQuestions,
      status: 'Draft',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'AI Quiz generated successfully. Review and publish when ready.',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quizzes for a specific course (Published only for students, all for instructors)
// @route   GET /api/quizzes/course/:courseId
// @access  Private
export const getQuizzesByCourse = async (req, res, next) => {
  try {
    const isInstructor = req.user && (req.user.role === 'Instructor' || req.user.role === 'Admin');
    const filter = { course: req.params.courseId };
    if (!isInstructor) filter.status = 'Published'; // students only see published

    const quizzes = await Quiz.find(filter)
      .select('-questions.correctAnswer -questions.explanation')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      message: 'Quizzes fetched successfully',
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor's own draft quizzes across all their courses
// @route   GET /api/quizzes/drafts
// @access  Private (Instructor/Admin)
export const getMyDraftQuizzes = async (req, res, next) => {
  try {
    // Get courses taught by this instructor
    const instructorCourses = await Course.find({ instructor: req.user._id }).select('_id title');
    const courseIds = instructorCourses.map(c => c._id);

    const drafts = await Quiz.find({ course: { $in: courseIds }, status: 'Draft' })
      .populate('course', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      message: 'Draft quizzes fetched successfully',
      data: drafts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single quiz (full for instructor, hidden answers for student)
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req, res, next) => {
  try {
    const isInstructor = req.user && (req.user.role === 'Instructor' || req.user.role === 'Admin');
    const selectQuery = isInstructor ? '' : '-questions.correctAnswer -questions.explanation';

    const quiz = await Quiz.findById(req.params.id).select(selectQuery);

    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    // Students cannot access drafts
    if (!isInstructor && quiz.status === 'Draft') {
      res.status(403);
      throw new Error('This quiz is not yet published');
    }

    res.status(200).json({
      success: true,
      message: 'Quiz fetched successfully',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish a Draft quiz
// @route   PATCH /api/quizzes/:id/publish
// @access  Private (Instructor/Admin)
export const publishQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'instructor');

    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    const isOwner = quiz.course?.instructor?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to publish this quiz');
    }

    quiz.status = 'Published';
    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz published successfully',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a draft quiz (edit questions before publishing)
// @route   PUT /api/quizzes/:id
// @access  Private (Instructor/Admin)
export const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'instructor');

    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    const isOwner = quiz.course?.instructor?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to edit this quiz');
    }

    const { title, timeLimit, passingScore, questions, difficulty, questionType } = req.body;
    if (title) quiz.title = title;
    if (timeLimit) quiz.timeLimit = timeLimit;
    if (passingScore) quiz.passingScore = passingScore;
    if (questions) quiz.questions = questions;
    if (difficulty) quiz.difficulty = difficulty;
    if (questionType) quiz.questionType = questionType;

    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Instructor/Admin)
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'instructor');

    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    const isOwner = quiz.course?.instructor?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to delete this quiz');
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a quiz and calculate score
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
export const submitQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const { answers } = req.body;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    if (quiz.status !== 'Published') {
      res.status(403);
      throw new Error('This quiz is not available yet');
    }

    let correctCount = 0;
    const evaluatedAnswers = [];

    answers.forEach(submittedAns => {
      const dbQuestion = quiz.questions.id(submittedAns.questionId);

      if (dbQuestion) {
        // For ShortAnswer, do a case-insensitive trim comparison
        let isCorrect;
        if (dbQuestion.type === 'ShortAnswer') {
          isCorrect = dbQuestion.correctAnswer.trim().toLowerCase() === submittedAns.selectedOption?.trim().toLowerCase();
        } else {
          isCorrect = dbQuestion.correctAnswer === submittedAns.selectedOption;
        }
        if (isCorrect) correctCount++;

        evaluatedAnswers.push({
          questionId: dbQuestion._id,
          selectedOption: submittedAns.selectedOption,
          isCorrect,
          correctAnswer: dbQuestion.correctAnswer,
          explanation: dbQuestion.explanation
        });
      }
    });

    const totalQuestions = quiz.questions.length;
    const scorePercentage = (correctCount / totalQuestions) * 100;
    const isPassed = scorePercentage >= quiz.passingScore;

    const quizAttempt = await QuizAttempt.create({
      user: userId,
      quiz: quizId,
      score: scorePercentage,
      totalQuestions,
      isPassed,
      answers: evaluatedAnswers
    });

    if (isPassed) {
      // Award XP based on score
      if (scorePercentage === 100) {
        awardXP(userId, 'PERFECT_QUIZ').catch(err => console.error('Perfect Quiz XP error:', err));
      } else {
        const pastPasses = await QuizAttempt.countDocuments({ user: userId, isPassed: true });
        awardXP(userId, 'QUIZ_PASS', { totalQuizPasses: pastPasses + 1 }).catch(err => console.error('Quiz Pass XP error:', err));
      }
    }

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        attemptId: quizAttempt._id,
        score: scorePercentage,
        isPassed,
        evaluatedAnswers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's quiz history/performance
// @route   GET /api/quizzes/history
// @access  Private
export const getQuizHistory = async (req, res, next) => {
  try {
    const history = await QuizAttempt.find({ user: req.user._id })
      .populate('quiz', 'title difficulty questionType')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      message: 'Quiz history fetched',
      data: history
    });
  } catch (error) {
    next(error);
  }
};
