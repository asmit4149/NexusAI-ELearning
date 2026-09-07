import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await axios.get('/api/users/leaderboard');
        if (data.success) {
          setUsers(data.data);
        }
      } catch (error) {
        toast.error('Failed to load leaderboard');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold flex items-center mb-6 text-gray-800 dark:text-white">
        <Trophy className="mr-3 text-yellow-500" size={28} />
        Top Learners Leaderboard
      </h2>
      
      <div className="space-y-4">
        {users.map((user, index) => (
          <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {index === 0 && <Medal className="absolute -top-2 -left-2 text-yellow-400 z-10" size={20} />}
                {index === 1 && <Medal className="absolute -top-2 -left-2 text-gray-400 z-10" size={20} />}
                {index === 2 && <Medal className="absolute -top-2 -left-2 text-amber-600 z-10" size={20} />}
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${index === 0 ? 'border-yellow-400' : index === 1 ? 'border-gray-400' : index === 2 ? 'border-amber-600' : 'border-primary'}`}>
                  <img src={user.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt={user.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{index + 1}. {user.name}</span>
                  {user.level && (
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold" title={`Level ${user.level.level}: ${user.level.name}`}>
                      Lvl {user.level.level} {user.level.icon}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {user.achievements && user.achievements.slice(0, 3).map((ach, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-blue-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] rounded flex items-center border border-slate-200 dark:border-slate-600" title={ach.name}>
                      <span className="mr-1">{ach.icon}</span>
                      {ach.name}
                    </span>
                  ))}
                  {(!user.achievements || user.achievements.length === 0) && user.badges && user.badges.slice(0, 3).map((badge, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-blue-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] rounded flex items-center border border-slate-200 dark:border-slate-600">
                      <span className="mr-1">{badge.icon || '🏅'}</span>
                      {badge.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <span className="block text-2xl font-black text-primary">{user.xp || user.points || 0}</span>
              <span className="text-xs font-bold text-slate-400 tracking-wider">XP</span>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center text-gray-500 py-4">No users found on the leaderboard.</div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
