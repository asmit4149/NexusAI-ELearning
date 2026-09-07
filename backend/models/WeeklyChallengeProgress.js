import mongoose from 'mongoose';

const weeklyChallengeProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeeklyChallenge',
    required: true
  },
  currentCount: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  xpAwarded: { type: Boolean, default: false }
}, { timestamps: true });

weeklyChallengeProgressSchema.index({ user: 1, challenge: 1 }, { unique: true });

const WeeklyChallengeProgress = mongoose.model('WeeklyChallengeProgress', weeklyChallengeProgressSchema);
export default WeeklyChallengeProgress;
