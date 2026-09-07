import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Users, BookOpen, Target, TrendingUp, AlertTriangle, 
  CheckCircle, Loader2, BarChart2 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InstructorAnalytics = () => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/analytics/instructor', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-slate-500">Compiling course insights...</p>
      </div>
    );
  }

  if (error || !user || (user.role !== 'Instructor' && user.role !== 'Admin')) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center p-8 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
        <AlertTriangle size={36} className="text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Access Denied</h2>
        <p className="text-sm text-red-600 dark:text-red-400">{error || 'Only Instructors and Admins can view these analytics.'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
            <BarChart2 size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Course Analytics</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm ml-14">
          Monitor your course performance, student engagement, and areas needing improvement.
        </p>
      </div>

      {/* Top KPIs */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Enrolled Students', value: analytics.kpis.totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Avg Completion Rate', value: `${analytics.kpis.overallCompletionRate}%`, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Avg Quiz Score', value: `${analytics.kpis.avgScoreOverall}%`, icon: Target, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Active Courses', value: analytics.kpis.totalCourses, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Col: Chart & Course Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trend Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Enrollment Trend</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">New students over the past 7 days</p>
              </div>
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.enrollmentTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px' }}
                    itemStyle={{ color: '#818CF8' }}
                  />
                  <Area type="monotone" dataKey="enrollments" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorEnrollments)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Course Breakdown Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Course Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-500 uppercase tracking-wide">
                    <th className="py-3 pr-4">Course Name</th>
                    <th className="py-3 px-4">Students</th>
                    <th className="py-3 px-4">Completion</th>
                    <th className="py-3 px-4">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {analytics.courseBreakdown.map((course) => (
                    <tr key={course.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 pr-4 font-semibold text-slate-800 dark:text-slate-200">{course.title}</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{course.students}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 dark:text-slate-400 w-8">{course.completionRate}%</span>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 max-w-[60px]">
                            <div className="h-full rounded-full bg-green-500" style={{ width: `${course.completionRate}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{course.avgQuizScore}%</td>
                    </tr>
                  ))}
                  {analytics.courseBreakdown.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500 italic">No courses found. Create one first!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Difficult Lessons */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="text-red-500" size={20} />
              <h2 className="text-lg font-bold text-red-900 dark:text-red-200">Needs Attention</h2>
            </div>
            <p className="text-xs text-red-700 dark:text-red-400 mb-4">
              Quizzes with the lowest average scores across your courses. Consider revising the material.
            </p>
            <div className="space-y-3">
              {analytics.difficultLessons.map((lesson, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-red-100 dark:border-red-900/20">
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">{lesson.quizTitle}</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{lesson.attempts} attempts</span>
                    <span className="font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                      Avg Score: {lesson.avgScore}%
                    </span>
                  </div>
                </div>
              ))}
              {analytics.difficultLessons.length === 0 && (
                <div className="text-center py-4 text-sm text-slate-500">
                  <CheckCircle size={24} className="mx-auto text-green-500 mb-2" />
                  No difficult lessons found!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorAnalytics;
