import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Lesson', 'Quiz', 'Revision'],
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    // Can be Lesson ID or Quiz ID
  },
  estimatedMinutes: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Overdue'],
    default: 'Pending',
  }
});

const daySchema = new mongoose.Schema({
  dayName: {
    type: String, // e.g., 'Monday', 'Day 1'
    required: true,
  },
  tasks: [taskSchema]
});

const weekSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true,
  },
  days: [daySchema]
});

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    weeklyHours: {
      type: Number,
      required: true,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    schedule: [weekSchema],
  },
  { timestamps: true }
);

studyPlanSchema.index({ user: 1, course: 1 });

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
export default StudyPlan;
