import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  passed: { type: Boolean, required: true },
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  actualOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
});

const codeSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingChallenge',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Passed', 'Failed', 'Error'],
    required: true
  },
  testResults: [testResultSchema],
  executionTimeMs: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0 // e.g. 100 for all passed, partial for some
  }
}, { timestamps: true });

codeSubmissionSchema.index({ user: 1, challenge: 1 });

const CodeSubmission = mongoose.model('CodeSubmission', codeSubmissionSchema);
export default CodeSubmission;
