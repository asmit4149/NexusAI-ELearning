import { GoogleGenerativeAI } from '@google/generative-ai';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import ChatHistory from '../models/ChatHistory.js';
import Enrollment from '../models/Enrollment.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { generateCoachAdvice } from '../services/aiCoachService.js';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// @desc    Chat with AI Tutor
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAITutor = async (req, res, next) => {
  try {
    const { message, courseId } = req.body;
    const userId = req.user._id;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // 1. Fetch Course Context
    let courseContext = 'General query';
    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) {
        courseContext = `Course Title: ${course.title}\nDescription: ${course.description}\nCategory: ${course.category}`;
        const lessons = await Lesson.find({ course: courseId }).sort('order');
        if (lessons.length > 0) {
          courseContext += '\n\nLessons in this course:\n' + lessons.map(l => `- ${l.title}: ${l.description}`).join('\n');
        }
      }
    }

    // 2. Build system instruction
    const systemInstruction = `You are an expert, encouraging, and helpful AI Tutor for the NexusAI E-Learning platform.\nContext about what the student is learning:\n${courseContext}\nRespond directly to the student in a helpful, concise, and educational manner. Format your response with clear markdown. Do not hallucinate course details not provided in the context.`;

    // 3. Fetch or Initialize Chat History
    let chatHistoryDoc = null;
    let formattedHistory = [];
    
    if (courseId) {
      chatHistoryDoc = await ChatHistory.findOne({ user: userId, course: courseId });
      
      if (!chatHistoryDoc) {
        chatHistoryDoc = new ChatHistory({ user: userId, course: courseId, messages: [] });
      } else {
        // Convert stored history to Gemini format
        formattedHistory = chatHistoryDoc.messages.map(msg => ({
          role: msg.role, // 'user' or 'model'
          parts: [{ text: msg.text }]
        }));
      }
    }

    // 4. Initialize Gemini Model and Chat
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction 
    });

    const chat = model.startChat({
      history: formattedHistory,
    });

    // Send the user message
    const result = await chat.sendMessage(message);
    const text = result.response.text() || 'Sorry, I could not generate a response.';

    // 5. Save History to DB
    if (chatHistoryDoc) {
      chatHistoryDoc.messages.push({ role: 'user', text: message });
      chatHistoryDoc.messages.push({ role: 'model', text: text });
      await chatHistoryDoc.save();
    }

    res.status(200).json({
      success: true,
      message: 'AI response generated',
      data: text
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Chat History for a Course
// @route   GET /api/ai/chat/:courseId/history
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    const chatHistory = await ChatHistory.findOne({ user: userId, course: courseId });

    res.status(200).json({
      success: true,
      data: chatHistory ? chatHistory.messages : []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI Learning Coach Advice
// @route   GET /api/ai/coach
// @access  Private
export const getLearningCoachAdvice = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = req.user;

    // Fetch enrollments
    const enrollments = await Enrollment.find({ user: userId, status: 'Active' });
    const activeCoursesCount = enrollments.length;
    const avgProgress = activeCoursesCount > 0 
      ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / activeCoursesCount) 
      : 0;

    // Fetch recent quizzes
    const recentQuizzes = await QuizAttempt.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('quiz', 'title course category');

    const formattedQuizzes = recentQuizzes.map(q => ({
      title: q.quiz?.title || 'Unknown Quiz',
      score: q.score,
      isPassed: q.isPassed
    }));

    // Calculate weak topics
    const topicScores = {};
    const allAttempts = await QuizAttempt.find({ user: userId }).populate('quiz', 'category');
    
    allAttempts.forEach(attempt => {
      const topic = attempt.quiz?.category || 'General';
      if (!topicScores[topic]) {
        topicScores[topic] = { totalScore: 0, count: 0 };
      }
      topicScores[topic].totalScore += attempt.score;
      topicScores[topic].count += 1;
    });

    const weakTopics = Object.keys(topicScores)
      .map(topic => ({
        name: topic,
        avgScore: Math.round(topicScores[topic].totalScore / topicScores[topic].count)
      }))
      .filter(t => t.avgScore < 70)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 3); // Top 3 weakest

    const studentData = {
      name: user.name,
      level: user.level || 1,
      xp: user.xp || 0,
      streak: user.streak || 0,
      activeCoursesCount,
      avgProgress,
      recentQuizzes: formattedQuizzes,
      weakTopics
    };

    const advice = await generateCoachAdvice(studentData);

    res.status(200).json({
      success: true,
      data: advice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI Code Hint
// @route   POST /api/ai/code-hint
// @access  Private
export const generateCodeHint = async (req, res, next) => {
  try {
    const { code, challengeDescription, language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemInstruction = `You are a Senior Technical Interviewer and Mentor.
A student is working on a coding challenge. Your job is to analyze their current code and the challenge description, and provide a helpful hint to guide them towards the solution.

CRITICAL RULES:
1. NEVER provide the complete working code or exact solution.
2. If there are syntax errors, point them out gently.
3. If their logic is flawed, ask a guiding question to make them think about edge cases.
4. Keep your response concise (under 150 words) and format it nicely in Markdown.
5. Provide a small snippet of pseudocode or syntax example ONLY if they are completely stuck on syntax.`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction 
    });

    const prompt = `Challenge Description:\n${challengeDescription}\n\nLanguage: ${language}\n\nStudent's Current Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nPlease provide a helpful hint without giving away the full solution.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text() || 'Keep trying! Review the challenge description and think about the edge cases.';

    res.status(200).json({
      success: true,
      data: text
    });
  } catch (error) {
    next(error);
  }
};
