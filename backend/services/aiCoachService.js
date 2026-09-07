import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_to_prevent_crash');

/**
 * Generates personalized learning coach advice using Gemini.
 */
export const generateCoachAdvice = async (studentData) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are an expert, encouraging, and highly personalized AI Learning Coach.
    Analyze the following student data and provide a highly personalized dashboard summary.
    
    Student Name: ${studentData.name}
    Level: ${studentData.level} (XP: ${studentData.xp})
    Current Streak: ${studentData.streak} days
    Active Courses: ${studentData.activeCoursesCount}
    Overall Progress: ${studentData.avgProgress}%
    
    Recent Quiz Performance:
    ${studentData.recentQuizzes.map(q => `- ${q.title}: ${q.score}% (${q.isPassed ? 'Passed' : 'Failed'})`).join('\n')}
    
    Weak Topics (Scores < 70%):
    ${studentData.weakTopics.map(t => `- ${t.name}: ${t.avgScore}%`).join('\n')}
    
    Return the output ONLY as a valid JSON object. Do NOT wrap it in markdown code blocks.
    
    Required JSON Format:
    {
      "summary": "A 2-sentence encouraging summary of their overall progress and current streak.",
      "dailyGoals": [
        "Goal 1 based on active courses or weak topics",
        "Goal 2"
      ],
      "alerts": [
        "Alert 1 focusing on a specific weak topic that needs attention"
      ],
      "reminders": [
        "Reminder to revise a specific failed quiz or continue a streak"
      ],
      "recommendations": [
        "Recommendation 1 (e.g., take a specific action, review a specific topic)",
        "Recommendation 2"
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJsonString = responseText.replace(/```json\n?|```/gi, '').trim();
    const parsedAdvice = JSON.parse(cleanJsonString);
    return parsedAdvice;
  } catch (error) {
    console.error('Error generating AI Coach advice:', error);
    // Fallback static data if AI fails
    return {
      summary: "Keep up the great work! You're making steady progress.",
      dailyGoals: ["Complete one more lesson today", "Take a practice quiz"],
      alerts: ["Make sure to review your weak topics."],
      reminders: ["Don't break your learning streak!"],
      recommendations: ["Review recent quiz mistakes to improve your score."]
    };
  }
};
