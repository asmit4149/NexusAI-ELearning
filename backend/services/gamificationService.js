import User from '../models/User.js';
import WeeklyChallenge from '../models/WeeklyChallenge.js';
import WeeklyChallengeProgress from '../models/WeeklyChallengeProgress.js';

// ============================
// XP LEVELS SYSTEM
// ============================
export const LEVELS = [
  { level: 1, name: 'Beginner',  minXP: 0,    icon: '🌱' },
  { level: 2, name: 'Explorer',  minXP: 100,  icon: '🔍' },
  { level: 3, name: 'Learner',   minXP: 300,  icon: '📚' },
  { level: 4, name: 'Achiever',  minXP: 600,  icon: '⭐' },
  { level: 5, name: 'Expert',    minXP: 1000, icon: '🚀' },
  { level: 6, name: 'Master',    minXP: 2000, icon: '🏆' },
  { level: 7, name: 'Legend',    minXP: 5000, icon: '👑' },
];

export const XP_EVENTS = {
  LOGIN_DAILY:        10,
  LESSON_COMPLETE:    20,
  QUIZ_PASS:          50,
  PERFECT_QUIZ:       100,
  COURSE_COMPLETE:    200,
  COURSE_ENROLL:      10,
  CODING_PASS:        75,
  STREAK_7:           100,
  STREAK_30:          500,
};

// ============================
// ALL POSSIBLE ACHIEVEMENTS
// ============================
const ACHIEVEMENTS = {
  'first-enrollment': { name: 'First Step',        icon: '👣', description: 'Enrolled in your first course' },
  'first-quiz-pass':  { name: 'Quiz Taker',         icon: '✅', description: 'Passed your first quiz' },
  'perfect-quiz':     { name: 'Perfectionist',      icon: '💯', description: 'Scored 100% on a quiz' },
  'first-course':     { name: 'Graduate',           icon: '🎓', description: 'Completed your first course' },
  'bookworm':         { name: 'Bookworm',            icon: '📚', description: 'Completed 5 courses' },
  'code-warrior':     { name: 'Code Warrior',        icon: '⚡', description: 'Passed your first coding challenge' },
  'streak-7':         { name: '7-Day Streak',        icon: '🔥', description: 'Maintained a 7-day learning streak' },
  'streak-30':        { name: '30-Day Streak',       icon: '💎', description: 'Maintained a 30-day learning streak' },
  'quiz-master':      { name: 'Quiz Master',         icon: '🧠', description: 'Passed 10 quizzes' },
  'level-5':          { name: 'Expert Reached',      icon: '🚀', description: 'Reached Level 5: Expert' },
  'level-7':          { name: 'Legend Status',       icon: '👑', description: 'Reached Level 7: Legend' },
};

// ============================
// MILESTONES
// ============================
const MILESTONES = {
  'xp-100':  { name: '100 XP Earned' },
  'xp-500':  { name: '500 XP Earned' },
  'xp-1000': { name: '1000 XP Earned' },
  'xp-5000': { name: '5000 XP Earned' },
};

/**
 * Computes level from total XP
 */
export const computeLevel = (xp) => {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXP) level = l;
    else break;
  }
  return level;
};

/**
 * Core function: Award XP to a user for an event.
 * Returns { user, xpGained, newLevel, newAchievements, newBadges, leveledUp }
 */
export const awardXP = async (userId, event, extraData = {}) => {
  const xpAmount = XP_EVENTS[event] || 0;
  if (!xpAmount) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const oldXP = user.xp || 0;
  const newXP = oldXP + xpAmount;
  user.xp = newXP;
  user.points = newXP; // keep legacy in sync

  // --- LEVEL UP ---
  const oldLevelObj = computeLevel(oldXP);
  const newLevelObj = computeLevel(newXP);
  const leveledUp = newLevelObj.level > oldLevelObj.level;
  user.level = newLevelObj.level;

  const newAchievements = [];
  const newBadges = [];

  // --- ACHIEVEMENTS CHECK ---
  const earned = user.achievements.map(a => a.slug);

  const grantAchievement = (slug) => {
    if (!earned.includes(slug) && ACHIEVEMENTS[slug]) {
      const a = ACHIEVEMENTS[slug];
      user.achievements.push({ slug, name: a.name, description: a.description, icon: a.icon });
      earned.push(slug);
      newAchievements.push({ slug, ...a });
    }
  };

  // Level-based achievements
  if (newLevelObj.level >= 5) grantAchievement('level-5');
  if (newLevelObj.level >= 7) grantAchievement('level-7');

  // XP Milestones
  const milestoneEarned = user.milestones.map(m => m.slug);
  const grantMilestone = (slug) => {
    if (!milestoneEarned.includes(slug) && MILESTONES[slug]) {
      user.milestones.push({ slug, name: MILESTONES[slug].name });
      milestoneEarned.push(slug);
    }
  };
  if (newXP >= 100) grantMilestone('xp-100');
  if (newXP >= 500) grantMilestone('xp-500');
  if (newXP >= 1000) grantMilestone('xp-1000');
  if (newXP >= 5000) grantMilestone('xp-5000');

  // Event-specific badges & achievements
  if (event === 'QUIZ_PASS') {
    grantAchievement('first-quiz-pass');
    // Count passed quizzes
    if ((extraData.totalQuizPasses || 0) >= 10) grantAchievement('quiz-master');
  }
  if (event === 'PERFECT_QUIZ') {
    grantAchievement('perfect-quiz');
    grantAchievement('first-quiz-pass');
  }
  if (event === 'COURSE_COMPLETE') {
    grantAchievement('first-course');
    if ((extraData.totalCoursesCompleted || 0) >= 5) grantAchievement('bookworm');
  }
  if (event === 'COURSE_ENROLL') {
    grantAchievement('first-enrollment');
  }
  if (event === 'CODING_PASS') {
    grantAchievement('code-warrior');
  }
  if (event === 'STREAK_7') {
    grantAchievement('streak-7');
  }
  if (event === 'STREAK_30') {
    grantAchievement('streak-30');
  }

  // If leveled up, grant level badge
  if (leveledUp) {
    const badgeName = `Level ${newLevelObj.level}: ${newLevelObj.name}`;
    const alreadyHas = user.badges.some(b => b.name === badgeName);
    if (!alreadyHas) {
      const badge = { name: badgeName, icon: newLevelObj.icon, earnedAt: new Date() };
      user.badges.push(badge);
      newBadges.push(badge);
    }
  }

  await user.save();

  // --- Update Weekly Challenge progress ---
  await updateWeeklyChallengeProgress(userId, event);

  return { user, xpGained: xpAmount, newLevel: newLevelObj, leveledUp, newAchievements, newBadges };
};

/**
 * Update daily streak for a user. Call on login / any learning activity.
 * Returns { streakUpdated, currentStreak, bonusXP }
 */
export const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let bonusXP = 0;

  if (!user.lastActivityDate) {
    // First ever activity
    user.streak = 1;
    user.lastActivityDate = today;
  } else {
    const lastActivity = new Date(user.lastActivityDate);
    const lastActivityDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
    const diffMs = today - lastActivityDay;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already active today — no change
      return { streakUpdated: false, currentStreak: user.streak };
    } else if (diffDays === 1) {
      // Consecutive day
      user.streak = (user.streak || 0) + 1;
      user.lastActivityDate = today;

      // Award streak bonuses
      if (user.streak === 7) {
        bonusXP = XP_EVENTS.STREAK_7;
        await awardXP(userId, 'STREAK_7');
      } else if (user.streak === 30) {
        bonusXP = XP_EVENTS.STREAK_30;
        await awardXP(userId, 'STREAK_30');
      }
    } else {
      // Streak broken
      user.streak = 1;
      user.lastActivityDate = today;
    }

    if (user.streak > (user.longestStreak || 0)) {
      user.longestStreak = user.streak;
    }
  }

  await user.save();
  return { streakUpdated: true, currentStreak: user.streak, bonusXP };
};

/**
 * Update progress for all active weekly challenges matching the event type.
 */
export const updateWeeklyChallengeProgress = async (userId, event) => {
  const eventMap = {
    QUIZ_PASS: 'quiz_pass',
    PERFECT_QUIZ: 'quiz_pass',
    LESSON_COMPLETE: 'lesson_complete',
    COURSE_ENROLL: 'course_enroll',
    CODING_PASS: 'coding_pass',
    LOGIN_DAILY: 'login',
  };

  const challengeEventType = eventMap[event];
  if (!challengeEventType) return;

  const now = new Date();
  const activeChallenges = await WeeklyChallenge.find({
    eventType: challengeEventType,
    isActive: true,
    weekStart: { $lte: now },
    weekEnd: { $gte: now }
  });

  for (const challenge of activeChallenges) {
    let progress = await WeeklyChallengeProgress.findOne({ user: userId, challenge: challenge._id });

    if (!progress) {
      progress = new WeeklyChallengeProgress({ user: userId, challenge: challenge._id, currentCount: 0 });
    }

    if (progress.completed) continue; // Already done

    progress.currentCount += 1;

    if (progress.currentCount >= challenge.targetCount && !progress.xpAwarded) {
      progress.completed = true;
      progress.completedAt = new Date();
      progress.xpAwarded = true;

      // Award bonus XP for completing the weekly challenge
      const user = await User.findById(userId);
      if (user) {
        user.xp = (user.xp || 0) + challenge.xpReward;
        user.points = user.xp;
        user.level = computeLevel(user.xp).level;
        await user.save();
      }
    }

    await progress.save();
  }
};

/**
 * Seed default weekly challenges for the current week if none exist.
 */
export const seedWeeklyChallenges = async () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const existingCount = await WeeklyChallenge.countDocuments({
    weekStart: monday,
    weekEnd: sunday
  });

  if (existingCount > 0) return; // Already seeded

  await WeeklyChallenge.insertMany([
    {
      title: 'Quiz Warrior',
      description: 'Pass 3 quizzes this week to earn bonus XP.',
      icon: '🧠',
      eventType: 'quiz_pass',
      targetCount: 3,
      xpReward: 150,
      weekStart: monday,
      weekEnd: sunday
    },
    {
      title: 'Daily Learner',
      description: 'Complete 5 lessons this week.',
      icon: '📖',
      eventType: 'lesson_complete',
      targetCount: 5,
      xpReward: 100,
      weekStart: monday,
      weekEnd: sunday
    },
    {
      title: 'Code Challenger',
      description: 'Pass 2 coding challenges this week.',
      icon: '💻',
      eventType: 'coding_pass',
      targetCount: 2,
      xpReward: 200,
      weekStart: monday,
      weekEnd: sunday
    },
  ]);

  console.log('✅ Weekly challenges seeded for this week.');
};
