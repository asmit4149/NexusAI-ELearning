import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || 'dummy_key',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// Using LLaMA 3 70B as the default model
const MODEL = 'meta/llama3-70b-instruct';

/**
 * Generates MCQ quiz questions (legacy format, kept for backward compatibility).
 */
export const generateQuizContent = async (topic, difficulty, numQuestions = 5) => {
  return generateQuestions({ topic, difficulty, numQuestions, questionType: 'MCQ' });
};

/**
 * Generates quiz questions of any type using Nvidia API.
 */
export const generateQuestions = async ({ topic, difficulty, numQuestions = 5, questionType = 'MCQ' }) => {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error('NVIDIA_API_KEY is missing from environment variables.');
  }

  let typeInstructions = '';
  let formatExample = '';

  if (questionType === 'MCQ') {
    typeInstructions = 'Create ONLY multiple choice questions. Each question must have exactly 4 options.';
    formatExample = `[
      {
        "type": "MCQ",
        "question": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A",
        "explanation": "Why Option A is correct."
      }
    ]`;
  } else if (questionType === 'TrueFalse') {
    typeInstructions = 'Create ONLY True/False questions. Each question has exactly 2 options: ["True", "False"].';
    formatExample = `[
      {
        "type": "TrueFalse",
        "question": "Statement here?",
        "options": ["True", "False"],
        "correctAnswer": "True",
        "explanation": "Why the answer is True."
      }
    ]`;
  } else if (questionType === 'ShortAnswer') {
    typeInstructions = 'Create ONLY short answer questions. No options are provided. The correct answer is a short phrase or sentence.';
    formatExample = `[
      {
        "type": "ShortAnswer",
        "question": "Question text?",
        "options": [],
        "correctAnswer": "The correct short answer.",
        "explanation": "A detailed explanation."
      }
    ]`;
  } else if (questionType === 'Mixed') {
    typeInstructions = `Create a MIX of question types. Approximately spread them: 40% MCQ (4 options), 30% True/False (2 options: ["True","False"]), 30% ShortAnswer (no options).`;
    formatExample = `[
      {
        "type": "MCQ",
        "question": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A",
        "explanation": "Explanation here."
      }
    ]`;
  }

  const systemPrompt = `You are an expert educational content creator. Output ONLY valid JSON array. Do NOT wrap in markdown \`\`\`json blocks. Return raw JSON.`;
  
  const userPrompt = `
    Generate a quiz about the topic: "${topic}".
    Difficulty: ${difficulty}.
    Total questions: ${numQuestions}.
    ${typeInstructions}
    
    Each object in the array must follow this format exactly:
    ${formatExample}
    
    Generate exactly ${numQuestions} questions.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    const cleanJsonString = responseText.replace(/```json\n?|```/gi, '').trim();
    const parsedQuestions = JSON.parse(cleanJsonString);
    return parsedQuestions;
  } catch (error) {
    console.error('Error generating quiz with Nvidia API:', error);
    throw new Error('Failed to generate AI quiz content. Please check your Nvidia API key and try again.');
  }
};

/**
 * Generates an AI Study Plan using Nvidia API based on pending tasks.
 */
export const generateStudyPlan = async ({ courseTitle, weeklyHours, targetDate, pendingLessons, quizzes }) => {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error('NVIDIA_API_KEY is missing from environment variables.');
  }

  const systemPrompt = `You are an expert educational planner. Output ONLY valid JSON array. Do NOT wrap in markdown \`\`\`json blocks. Return raw JSON.`;

  const userPrompt = `
    Create a detailed study plan for a student taking the course "${courseTitle}".
    The student has ${weeklyHours} hours per week available to study.
    Their target completion date is ${new Date(targetDate).toLocaleDateString()}.
    
    Pending Lessons:
    ${pendingLessons.map(l => `- ID: ${l._id} | Title: ${l.title} | Est Duration: ${l.duration || 30} mins`).join('\n')}
    
    Pending Quizzes:
    ${quizzes.map(q => `- ID: ${q._id} | Title: ${q.title} | Time Limit: ${q.timeLimit || 15} mins`).join('\n')}
    
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
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    const cleanJsonString = responseText.replace(/```json\n?|```/gi, '').trim();
    const parsedPlan = JSON.parse(cleanJsonString);
    return parsedPlan;
  } catch (error) {
    console.error('Error generating study plan with Nvidia API:', error);
    throw new Error('Failed to generate AI study plan. Please check your Nvidia API key and try again.');
  }
};
