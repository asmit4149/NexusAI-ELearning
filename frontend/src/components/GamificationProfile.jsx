import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Flame, Star, Target, Loader2, Award, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const GamificationProfile = () => {
  const [profile, setProfile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, challengesRes] = await Promise.all([
          axios.get('/api/users/me/gamification', { headers }),
          axios.get('/api/users/weekly-challenges', { headers })
        ]);

        setProfile(profileRes.data.data);
        setChallenges(challengesRes.data.data);
      } catch (err) {
        console.error('Failed to load gamification data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGamification();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-10">
      
      {/* Top Section: XP & Streak */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        
        {/* Level Badge */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg transform -rotate-6">
            {profile.level.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Level {profile.level.level}: {profile.level.name}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              {profile.xp} Total XP
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 px-5 py-3 rounded-2xl border border-orange-100 dark:border-orange-900/30">
          <Flame size={28} className={profile.streak > 0 ? 'text-orange-500' : 'text-slate-400 grayscale'} />
          <div>
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Daily Streak</p>
            <p className="text-xl font-black text-orange-700 dark:text-orange-300">
              {profile.streak} {profile.streak === 1 ? 'Day' : 'Days'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar to next level */}
      <div className="mb-10">
        <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
          <span>Current: {profile.xp} XP</span>
          <span>Next: {profile.nextLevel.name} ({profile.nextLevel.minXP} XP)</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${profile.progressPct}%` }}
          ></div>
        </div>
        <p className="text-xs text-right mt-1 text-slate-500">{profile.xpToNextLevel} XP needed to level up</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Achievements */}
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" /> Recent Achievements
          </h4>
          {profile.achievements?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {profile.achievements.slice().reverse().slice(0, 4).map((ach, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-2xl bg-white dark:bg-slate-700 w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                    {ach.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{ach.name}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              Complete courses and quizzes to earn achievements!
            </div>
          )}
        </div>

        {/* Weekly Challenges */}
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Target size={18} className="text-red-500" /> Weekly Challenges
          </h4>
          {challenges.length > 0 ? (
            <div className="space-y-3">
              {challenges.slice(0, 2).map((ch) => (
                <div key={ch._id} className={`p-4 rounded-xl border ${ch.completed ? 'border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'} shadow-sm relative overflow-hidden`}>
                  
                  {ch.completed && (
                    <div className="absolute -right-4 -top-4 w-12 h-12 bg-green-500 rotate-45 flex items-end justify-center pb-1">
                      <Star size={12} className="text-white -rotate-45" fill="currentColor" />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{ch.icon}</span>
                      <h5 className={`font-bold text-sm ${ch.completed ? 'text-green-700 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {ch.title}
                      </h5>
                    </div>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap size={10} fill="currentColor" /> {ch.xpReward} XP
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mt-3">
                    <span className="text-slate-500">{ch.completed ? 'Completed!' : `${ch.currentCount} / ${ch.targetCount} done`}</span>
                    {!ch.completed && (
                      <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min((ch.currentCount / ch.targetCount) * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              No active challenges this week. Check back later!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamificationProfile;
