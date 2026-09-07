import CodingChallenge from '../models/CodingChallenge.js';
import CodeSubmission from '../models/CodeSubmission.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import axios from 'axios';
import { awardXP } from '../services/gamificationService.js';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

// Mapping frontend language selections to Piston API requirements
const languageMap = {
  'javascript': { language: 'javascript', version: '18.15.0' },
  'python': { language: 'python', version: '3.10.0' },
  'java': { language: 'java', version: '15.0.2' },
  'c++': { language: 'c++', version: '10.2.0' },
  'go': { language: 'go', version: '1.16.2' },
};

// @desc    Create a new coding challenge
// @route   POST /api/code/challenge
// @access  Private (Instructor)
export const createChallenge = async (req, res, next) => {
  try {
    const { title, description, courseId, language, starterCode, testCases } = req.body;

    // Verify course ownership
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to add challenges to this course');
    }

    const challenge = await CodingChallenge.create({
      title,
      description,
      course: courseId,
      language,
      starterCode,
      testCases,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: challenge
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get challenges for a course
// @route   GET /api/code/course/:courseId
// @access  Private
export const getChallenges = async (req, res, next) => {
  try {
    // Basic authorization could go here
    const challenges = await CodingChallenge.find({ course: req.params.courseId }).select('-testCases.expectedOutput -testCases.isHidden'); // Don't send hidden details to frontend entirely if needed, but we need inputs for public tests. Let's send everything except hidden outputs.
    
    // Actually, for simplicity and since we evaluate on backend, we can just send the challenge. The frontend doesn't need to know hidden test cases.
    const sanitizedChallenges = challenges.map(c => {
      const challengeObj = c.toObject();
      challengeObj.testCases = challengeObj.testCases.map(tc => {
        if (tc.isHidden) {
          return { _id: tc._id, isHidden: true }; // hide input/output
        }
        return tc;
      });
      return challengeObj;
    });

    res.status(200).json({
      success: true,
      data: sanitizedChallenges
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific challenge details (and past submission if any)
// @route   GET /api/code/challenge/:id
// @access  Private
export const getChallengeDetails = async (req, res, next) => {
  try {
    const challenge = await CodingChallenge.findById(req.params.id);
    if (!challenge) {
      res.status(404);
      throw new Error('Challenge not found');
    }

    const submission = await CodeSubmission.findOne({ user: req.user._id, challenge: challenge._id }).sort('-createdAt');

    const challengeObj = challenge.toObject();
    challengeObj.testCases = challengeObj.testCases.map(tc => tc.isHidden ? { _id: tc._id, isHidden: true } : tc);

    res.status(200).json({
      success: true,
      data: {
        challenge: challengeObj,
        lastSubmission: submission || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit code for evaluation
// @route   POST /api/code/submit/:challengeId
// @access  Private
export const submitCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const challenge = await CodingChallenge.findById(req.params.challengeId);
    
    if (!challenge) {
      res.status(404);
      throw new Error('Challenge not found');
    }

    const pistonConfig = languageMap[challenge.language] || { language: challenge.language, version: '*' };
    
    let allPassed = true;
    let totalTime = 0;
    const testResults = [];
    let hasError = false;

    // Run code against each test case using Piston API
    // Note: In production with many test cases, you'd want to batch this or use a worker queue.
    for (const testCase of challenge.testCases) {
      try {
        const response = await axios.post(PISTON_API_URL, {
          language: pistonConfig.language,
          version: pistonConfig.version,
          files: [{ content: code }],
          stdin: testCase.input,
          compile_timeout: 5000,
          run_timeout: 3000
        });

        const { run, compile } = response.data;
        
        // If compilation failed
        if (compile && compile.code !== 0) {
          hasError = true;
          allPassed = false;
          testResults.push({
            passed: false,
            input: testCase.isHidden ? 'Hidden' : testCase.input,
            expectedOutput: testCase.isHidden ? 'Hidden' : testCase.expectedOutput,
            actualOutput: compile.output || 'Compilation Error',
            isHidden: testCase.isHidden
          });
          break; // Stop running further tests if compilation fails
        }

        // If execution failed (runtime error)
        if (run.code !== 0) {
          hasError = true;
          allPassed = false;
          testResults.push({
            passed: false,
            input: testCase.isHidden ? 'Hidden' : testCase.input,
            expectedOutput: testCase.isHidden ? 'Hidden' : testCase.expectedOutput,
            actualOutput: run.output || 'Runtime Error',
            isHidden: testCase.isHidden
          });
          continue;
        }

        const actualOutput = run.stdout ? run.stdout.trim() : '';
        const expectedOutput = testCase.expectedOutput.trim();
        const passed = actualOutput === expectedOutput;

        if (!passed) allPassed = false;
        
        testResults.push({
          passed,
          input: testCase.isHidden ? 'Hidden' : testCase.input,
          expectedOutput: testCase.isHidden ? 'Hidden' : expectedOutput,
          actualOutput: testCase.isHidden ? (passed ? 'Hidden Match' : 'Hidden Mismatch') : actualOutput,
          isHidden: testCase.isHidden
        });

      } catch (err) {
        console.error('Piston API Error:', err.response?.data || err.message);
        hasError = true;
        allPassed = false;
        testResults.push({
          passed: false,
          input: testCase.isHidden ? 'Hidden' : testCase.input,
          expectedOutput: testCase.isHidden ? 'Hidden' : testCase.expectedOutput,
          actualOutput: 'Execution Service Error',
          isHidden: testCase.isHidden
        });
      }
    }

    // Calculate score
    const passedCount = testResults.filter(r => r.passed).length;
    const totalCount = challenge.testCases.length;
    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
    
    let status = 'Failed';
    if (hasError && passedCount === 0) status = 'Error';
    else if (allPassed) status = 'Passed';

    // Save submission
    const submission = await CodeSubmission.create({
      user: req.user._id,
      challenge: challenge._id,
      code,
      language: challenge.language,
      status,
      testResults,
      score
    });

    if (status === 'Passed') {
      // Award XP for passing coding challenge
      awardXP(req.user._id, 'CODING_PASS').catch(err => console.error('Coding Pass XP error:', err));
    }

    res.status(200).json({
      success: true,
      message: `Execution completed. Score: ${score}%`,
      data: submission
    });

  } catch (error) {
    next(error);
  }
};
