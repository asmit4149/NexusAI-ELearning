import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: '🏅' },
  earnedAt: { type: Date, default: Date.now }
}, { _id: false });

const achievementSchema = new mongoose.Schema({
  slug: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: '🏆' },
  earnedAt: { type: Date, default: Date.now }
}, { _id: false });

const milestoneSchema = new mongoose.Schema({
  slug: { type: String, required: true },
  name: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['Student', 'Instructor', 'Admin'],
      default: 'Student',
    },
    avatar: {
      type: String,
      default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },

    // =====================
    // Legacy - Keep for compatibility
    // =====================
    points: {
      type: Number,
      default: 0,
    },

    // =====================
    // Advanced Gamification
    // =====================
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    // Richer badges (replaces flat string array)
    badges: {
      type: [badgeSchema],
      default: [],
    },
    achievements: {
      type: [achievementSchema],
      default: [],
    },
    milestones: {
      type: [milestoneSchema],
      default: [],
    },

    // Streak tracking
    streak: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
      default: null,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    // =====================
    // Subscriptions
    // =====================
    subscriptionStatus: {
      type: String,
      enum: ['none', 'active', 'past_due', 'canceled'],
      default: 'none',
    },
    activeSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    }
  },
  { timestamps: true }
);

// Indexes

userSchema.index({ xp: -1 }); // For leaderboard sorting

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
