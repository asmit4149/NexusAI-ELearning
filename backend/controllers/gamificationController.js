import User from '../models/User.js';
import WeeklyChallenge from '../models/WeeklyChallenge.js';
import WeeklyChallengeProgress from '../models/WeeklyChallengeProgress.js';
import { LEVELS, computeLevel } from '../services/gamificationService.js';

// @desc    Get full gamification profile for current user
// @route   GET /api/users/me/gamification
// @access  Private
export const getGamificationProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('name avatar xp level streak longestStreak lastActivityDate badges achievements milestones points');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const currentLevelObj = computeLevel(user.xp);
    const nextLevelObj = LEVELS.find(l => l.level === currentLevelObj.level + 1) || currentLevelObj;
    const xpIntoCurrentLevel = user.xp - currentLevelObj.minXP;
    const xpNeededForNext = nextLevelObj.minXP - currentLevelObj.minXP;
    const progressPct = nextLevelObj.level === currentLevelObj.level
      ? 100
      : Math.min(Math.round((xpIntoCurrentLevel / xpNeededForNext) * 100), 100);

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        avatar: user.avatar,
        xp: user.xp,
        level: currentLevelObj,
        nextLevel: nextLevelObj,
        progressPct,
        xpToNextLevel: Math.max(nextLevelObj.minXP - user.xp, 0),
        streak: user.streak,
        longestStreak: user.longestStreak,
        lastActivityDate: user.lastActivityDate,
        badges: user.badges,
        achievements: user.achievements,
        milestones: user.milestones
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active weekly challenges with user's progress
// @route   GET /api/users/weekly-challenges
// @access  Private
export const getWeeklyChallenges = async (req, res, next) => {
  try {
    const now = new Date();
    const activeChallenges = await WeeklyChallenge.find({
      isActive: true,
      weekStart: { $lte: now },
      weekEnd: { $gte: now }
    });

    const result = await Promise.all(activeChallenges.map(async (challenge) => {
      const progress = await WeeklyChallengeProgress.findOne({
        user: req.user._id,
        challenge: challenge._id
      });
      return {
        _id: challenge._id,
        title: challenge.title,
        description: challenge.description,
        icon: challenge.icon,
        targetCount: challenge.targetCount,
        xpReward: challenge.xpReward,
        weekEnd: challenge.weekEnd,
        currentCount: progress ? progress.currentCount : 0,
        completed: progress ? progress.completed : false
      };
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard (sorted by XP, includes level)
// @route   GET /api/users/leaderboard
// @access  Public
export const getLeaderboard = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const topUsers = await User.find({ role: 'Student' })
      .sort({ xp: -1, points: -1 })
      .limit(limit)
      .select('name avatar xp level points badges achievements');

    const enriched = topUsers.map(u => {
      const levelObj = computeLevel(u.xp || 0);
      return {
        _id: u._id,
        name: u.name,
        avatar: u.avatar,
        xp: u.xp || u.points || 0,
        level: levelObj,
        badges: u.badges || [],
        achievements: u.achievements || []
      };
    });

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};
