import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Target, Award, Clock, Activity, Loader2, Code2, ChevronRight, Sparkles } from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import PersonalizedLearningPath from '../components/PersonalizedLearningPath';
import GamificationProfile from '../components/GamificationProfile';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [analyticsRes, enrollmentsRes] = await Promise.all([
          axios.get('/api/analytics/student', { headers }),
          axios.get('/api/users/my-enrollments', { headers })
        ]);

        setAnalytics(analyticsRes.data.data);
        setEnrollments(enrollmentsRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl"
    >
      {/* Premium Hero Section */}
      <motion.div variants={itemVariants} className="mb-12 relative p-10 rounded-[2rem] premium-glass">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-500/30 dark:bg-primary-500/20 rounded-full mix-blend-screen dark:mix-blend-lighten filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/30 dark:bg-blue-500/20 rounded-full mix-blend-screen dark:mix-blend-lighten filter blur-[100px] animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/20 backdrop-blur-md text-sm font-semibold text-primary-700 dark:text-primary-300 mb-6 shadow-sm">
              <Sparkles size={16} className="text-primary-600 dark:text-primary-400" />
              <span>Welcome to NexusAI 2.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 dark:from-primary-400 dark:via-purple-400 dark:to-blue-400">{user?.name || 'Student'}</span>! 👋
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl font-medium">
              Ready to level up your skills today? Here is your learning progress and upcoming AI-driven assessments.
            </p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="animate-spin text-primary-500" size={48} /></div>
      ) : (
        <>
          {/* Gamification Widget */}
          <GamificationProfile />

          {/* Stats Grid */}
          <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Active Courses', value: analytics?.overview?.activeCourses || 0, icon: BookOpen, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100/80 dark:bg-blue-500/10', border: 'hover:border-blue-500/30' },
              { label: 'Completed Courses', value: analytics?.overview?.completedCourses || 0, icon: Award, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100/80 dark:bg-amber-500/10', border: 'hover:border-amber-500/30' },
              { label: 'Quizzes Passed', value: analytics?.quizStats?.passedQuizzes || 0, icon: Target, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100/80 dark:bg-emerald-500/10', border: 'hover:border-emerald-500/30' },
              { label: 'Avg Progress', value: `${analytics?.overview?.avgProgress || 0}%`, icon: Clock, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100/80 dark:bg-purple-500/10', border: 'hover:border-purple-500/30' },
            ].map((stat, i) => (
              <div key={i} className={`flex items-center gap-5 rounded-2xl glass-card p-6 ${stat.border} group`}>
                <div className={`rounded-2xl p-4 ${stat.bg} ${stat.color} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Personalized Learning Path */}
          <div className="mb-12">
            <PersonalizedLearningPath />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Chart Section */}
              <section className="rounded-[2rem] glass-card p-8">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Learning Activity</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Your quiz activity over the past 7 days</p>
                  </div>
                  <div className="rounded-xl bg-primary-50 dark:bg-primary-500/10 p-3 text-primary-600 dark:text-primary-400 shadow-sm border border-primary-100 dark:border-primary-500/20">
                    <Activity size={24} />
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.activityTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                        itemStyle={{ color: '#C4B5FD', fontWeight: 'bold' }}
                        cursor={{ stroke: 'rgba(139, 92, 246, 0.2)', strokeWidth: 2 }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6, strokeWidth: 0, fill: '#A78BFA', style: {filter: 'drop-shadow(0 0 8px rgba(167,139,250,0.8))'} }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Coding Challenges - Per Enrolled Course */}
              {enrollments.length > 0 && (
                <section className="rounded-[2rem] glass-card p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      <Code2 size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Coding Challenges</h2>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Practice problems from your enrolled courses</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {enrollments.slice(0, 4).map(course => (
                      <Link
                        key={course._id}
                        to={`/courses/${course._id}/challenges`}
                        className="group flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-white/40 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-blue-500/20 transition-all">
                            {course.title?.charAt(0)}
                          </div>
                          <span className="text-base font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{course.title}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                          <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Completed Courses & Certificates */}
              {enrollments.filter(e => e.status === 'Completed').length > 0 && (
                <section className="rounded-[2rem] glass-card p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Award size={24} />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Completed Courses</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Download your earned certificates</p>
                      </div>
                      <Link to="/certificates" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                        View All &rarr;
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {enrollments.filter(e => e.status === 'Completed').slice(0, 4).map(course => (
                      <div
                        key={course._id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-white/40 dark:border-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Award size={20} />
                          </div>
                          <span className="text-base font-semibold text-slate-800 dark:text-slate-200">{course.title}</span>
                        </div>
                        <Link 
                          to="/certificates"
                          className="px-4 py-2 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-700 dark:text-primary-300 text-sm font-bold transition-colors border border-primary-500/20"
                        >
                          Certificate
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Topics Performance */}
              {(analytics?.strongTopics?.length > 0 || analytics?.weakTopics?.length > 0) && (
                <section className="rounded-[2rem] glass-card p-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Topic Performance</h2>
                  
                  {analytics.strongTopics.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">Strong Topics</p>
                      <div className="space-y-3">
                        {analytics.strongTopics.slice(0, 3).map((t, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{t.name}</span>
                            <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                              {t.avgScore}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analytics.weakTopics.length > 0 && (
                    <div className="pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-3">Needs Improvement</p>
                      <div className="space-y-3">
                        {analytics.weakTopics.slice(0, 3).map((t, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{t.name}</span>
                            <div className="px-2 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs">
                              {t.avgScore}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Gamification / Leaderboard */}
              <section className="glass-panel rounded-[2rem] overflow-hidden">
                <Leaderboard />
              </section>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;
