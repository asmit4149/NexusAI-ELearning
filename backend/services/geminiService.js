import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_to_prevent_crash');

/**
 * Generates MCQ quiz questions (legacy format, kept for backward compatibility).
 */
export const generateQuizContent = async (topic, difficulty, numQuestions = 5) => {
  return generateQuestions({ topic, difficulty, numQuestions, questionType: 'MCQ' });
};

/**
 * Generates quiz questions of any type using Gemini.
 * @param {Object} options
 * @param {string} options.topic - Topic or custom subject to generate on.
 * @param {string} options.difficulty - Easy, Medium, or Hard.
 * @param {number} options.numQuestions - Number of questions to generate.
 * @param {string} options.questionType - MCQ | TrueFalse | ShortAnswer | Mixed
 * @returns {Array} Array of question objects.
 */
export const generateQuestions = async ({ topic, difficulty, numQuestions = 5, questionType = 'MCQ' }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let typeInstructions = '';
  let formatExample = '';

  if (questionType === 'MCQ') {
    typeInstructions = 'Create ONLY multiple choice questions. Each question must have exactly 4 options.';
    formatExample = `{
      "type": "MCQ",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why Option A is correct."
    }`;
  } else if (questionType === 'TrueFalse') {
    typeInstructions = 'Create ONLY True/False questions. Each question has exactly 2 options: ["True", "False"].';
    formatExample = `{
      "type": "TrueFalse",
      "question": "Statement here?",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Why the answer is True."
    }`;
  } else if (questionType === 'ShortAnswer') {
    typeInstructions = 'Create ONLY short answer questions. No options are provided. The correct answer is a short phrase or sentence.';
    formatExample = `{
      "type": "ShortAnswer",
      "question": "Question text?",
      "options": [],
      "correctAnswer": "The correct short answer.",
      "explanation": "A detailed explanation."
    }`;
  } else if (questionType === 'Mixed') {
    typeInstructions = `Create a MIX of question types. Approximately spread them: 40% MCQ (4 options), 30% True/False (2 options: ["True","False"]), 30% ShortAnswer (no options).`;
    formatExample = `{
      "type": "MCQ" | "TrueFalse" | "ShortAnswer",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"] | ["True", "False"] | [],
      "correctAnswer": "Correct value here",
      "explanation": "Explanation here."
    }`;
  }

  const prompt = `
    You are an expert educational content creator. Generate a quiz about the topic: "${topic}".
    Difficulty: ${difficulty}.
    Total questions: ${numQuestions}.
    ${typeInstructions}
    
    Return the output ONLY as a valid JSON array. Do NOT wrap it in markdown code blocks.
    Each object in the array must follow this format exactly:
    ${formatExample}
    
    Generate exactly ${numQuestions} questions. Output ONLY the raw JSON array.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJsonString = responseText.replace(/```json\n?|```/gi, '').trim();
    const parsedQuestions = JSON.parse(cleanJsonString);
    return parsedQuestions;
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    throw new Error('Failed to generate AI quiz content. Please check your API key and try again.');
  }
};

/**
 * Generates an AI Study Plan using Gemini based on pending tasks.
 */
export const generateStudyPlan = async ({ courseTitle, weeklyHours, targetDate, pendingLessons, quizzes }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // Using pro for better reasoning

  const prompt = `
    You are an expert educational planner. Create a detailed study plan for a student taking the course "${courseTitle}".
    The student has ${weeklyHours} hours per week available to study.
    Their target completion date is ${new Date(targetDate).toLocaleDateString()}.
    
    Here are the tasks they need to complete:
    Pending Lessons:
    ${pendingLessons.map(l => `- ID: ${l._id} | Title: ${l.title} | Est Duration: ${l.duration || 30} mins`).join('\n')}
    
    Pending Quizzes:
    ${quizzes.map(q => `- ID: ${q._id} | Title: ${q.title} | Time Limit: ${q.timeLimit || 15} mins`).join('\n')}
    
    You should also schedule "Revision" blocks appropriately.
    
    Distribute these tasks into a weekly schedule.
    Return the output ONLY as a valid JSON array of weeks. Do not wrap it in markdown code blocks.
    
    Format:
    [
      {
        "weekNumber": 1,
        "days": [
          {
            "dayName": "Day 1",
            "tasks": [
              {
                "title": "Lesson title or Quiz title or 'Revision: Topic'",
                "type": "Lesson" | "Quiz" | "Revision",
                "referenceId": "Provide the ID of the lesson or quiz. For Revision, leave empty",
                "estimatedMinutes": 30
              }
            ]
          }
        ]
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJsonString = responseText.replace(/```json\n?|```/gi, '').trim();
    const parsedPlan = JSON.parse(cleanJsonString);
    return parsedPlan;
  } catch (error) {
    console.error('Error generating study plan with Gemini:', error);
    throw new Error('Failed to generate AI study plan. Please check your API key and try again.');
  }
};
