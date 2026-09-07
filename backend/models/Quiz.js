import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question'],
  },
  type: {
    type: String,
    enum: ['MCQ', 'TrueFalse', 'ShortAnswer'],
    default: 'MCQ',
  },
  options: {
    type: [String],
    default: [],
    // MCQ requires 4 options; TrueFalse has 2; ShortAnswer has none
  },
  correctAnswer: {
    type: String,
    required: [true, 'Please specify the correct answer'],
  },
  explanation: {
    type: String,
    required: [true, 'Please provide an explanation for the correct answer'],
  }
});

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a quiz title'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    questionType: {
      type: String,
      enum: ['MCQ', 'TrueFalse', 'ShortAnswer', 'Mixed'],
      default: 'MCQ'
    },
    timeLimit: {
      type: Number,
      default: 15 // in minutes
    },
    questions: [questionSchema],
    passingScore: {
      type: Number,
      required: [true, 'Please specify a passing score (percentage)'],
      min: 1,
      max: 100,
      default: 80,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true }
);

quizSchema.index({ course: 1 });
quizSchema.index({ status: 1, course: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
