import mongoose from 'mongoose';

const weeklyChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🎯' },
  // The event type students need to perform
  eventType: {
    type: String,
    enum: ['quiz_pass', 'lesson_complete', 'course_enroll', 'coding_pass', 'login'],
    required: true
  },
  targetCount: { type: Number, required: true, default: 1 },
  xpReward: { type: Number, required: true, default: 100 },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const WeeklyChallenge = mongoose.model('WeeklyChallenge', weeklyChallengeSchema);
export default WeeklyChallenge;
