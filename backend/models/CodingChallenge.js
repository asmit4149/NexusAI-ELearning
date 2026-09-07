import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
});

const codingChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'c++', 'go'],
    required: true
  },
  starterCode: {
    type: String,
    default: ''
  },
  testCases: [testCaseSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const CodingChallenge = mongoose.model('CodingChallenge', codingChallengeSchema);
export default CodingChallenge;
