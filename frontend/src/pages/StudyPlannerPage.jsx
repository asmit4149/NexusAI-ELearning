import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  CalendarDays, Clock, Target, PlayCircle, Loader2, Sparkles, BookOpen,
  CheckCircle, AlertCircle, RefreshCw, Plus, ChevronRight, FileText
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const StudyPlannerPage = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [targetDate, setTargetDate] = useState('');
  
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    // Fetch user's enrolled courses
    axios.get('/api/users/my-enrollments', { headers: getAuthHeader() })
      .then(res => setCourses(res.data.data || []))
      .catch(err => console.error('Failed to fetch enrolled courses', err));
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchPlan(selectedCourse);
    } else {
      setPlan(null);
    }
  }, [selectedCourse]);

  const fetchPlan = async (courseId) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/planner/${courseId}`, { headers: getAuthHeader() });
      setPlan(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedCourse) { toast.error('Please select a course'); return; }
    if (!weeklyHours || !targetDate) { toast.error('Please fill all fields'); return; }

    setGenerating(true);
    try {
      const { data } = await axios.post(`/api/planner/generate/${selectedCourse}`, {
        weeklyHours,
        targetDate
      }, { headers: getAuthHeader() });
      toast.success('AI Study Plan generated successfully!');
      setPlan(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleRecalibrate = async () => {
    setGenerating(true);
    try {
      const { data } = await axios.patch(`/api/planner/${selectedCourse}/recalibrate`, {}, { headers: getAuthHeader() });
      toast.success('Plan recalibrated based on your current progress!');
      setPlan(data.data);
    } catch (err) {
      toast.error('Failed to recalibrate plan');
    } finally {
      setGenerating(false);
    }
  };

  const fieldClass = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary";

  const getTaskIcon = (type) => {
    switch (type) {
      case 'Lesson': return <PlayCircle size={16} className="text-blue-500" />;
      case 'Quiz': return <FileText size={16} className="text-amber-500" />;
      case 'Revision': return <RefreshCw size={16} className="text-green-500" />;
      default: return <BookOpen size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-sm">
            <CalendarDays size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Study Planner</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm ml-14">
          Generate a personalized, adaptive study schedule to reach your goals on time.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Controls */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Target size={18} className="text-primary" /> Setup Your Plan
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Select Course</label>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className={fieldClass} required>
                  <option value="">Choose an enrolled course...</option>
                  {courses.length === 0 ? (
                    <option disabled>No enrolled courses found. Please enroll in a course first.</option>
                  ) : (
                    courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Weekly Study Hours</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="number" min="1" max="40" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} className={`${fieldClass} pl-10`} required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Target Completion Date</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={fieldClass} required />
              </div>

              <button
                type="submit"
                disabled={generating || !selectedCourse}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3 font-semibold text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {generating ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><Sparkles size={18} /> Generate Plan</>}
              </button>
            </form>
          </div>

          {plan && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Plan Overview</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Weekly Goal:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{plan.weeklyHours} hours</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Target Date:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{new Date(plan.targetDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Total Weeks:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{plan.schedule?.length || 0}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={handleRecalibrate} disabled={generating} className="w-full flex justify-center items-center gap-2 text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 py-2.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
                  <RefreshCw size={14} /> Recalibrate Plan
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-2">Use this if you fall behind to readjust your schedule.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Timeline */}
        <div className="lg:col-span-2">
          {!selectedCourse ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <CalendarDays size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Course Selected</h3>
              <p className="text-sm text-slate-500 mt-2">Select a course to view or generate your study plan.</p>
            </div>
          ) : loading ? (
             <div className="h-full min-h-[300px] flex justify-center items-center">
               <Loader2 className="animate-spin text-primary" size={32} />
             </div>
          ) : !plan ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Sparkles size={48} className="text-primary/40 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Plan Found</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">You haven't generated a study plan for this course yet. Fill the details on the left to get your AI-powered schedule.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {plan.schedule.map((week, wIdx) => (
                <div key={wIdx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white">Week {week.weekNumber}</h3>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                      {week.days.length} Days
                    </span>
                  </div>
                  <div className="p-6 space-y-6">
                    {week.days.map((day, dIdx) => (
                      <div key={dIdx} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                        <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary ring-4 ring-white dark:ring-slate-900"></div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{day.dayName}</h4>
                        <div className="space-y-3">
                          {day.tasks.map((task, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                              <div className="mt-0.5">{getTaskIcon(task.type)}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 dark:text-white leading-snug">{task.title}</p>
                                <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
                                  <span className="flex items-center gap-1"><Clock size={12} /> {task.estimatedMinutes} min</span>
                                  <span className="bg-slate-200 dark:bg-slate-700 px-1.5 rounded">{task.type}</span>
                                </div>
                              </div>
                              <div>
                                {task.status === 'Completed' ? (
                                  <CheckCircle size={18} className="text-green-500" />
                                ) : task.status === 'Overdue' ? (
                                  <AlertCircle size={18} className="text-red-500" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlannerPage;
