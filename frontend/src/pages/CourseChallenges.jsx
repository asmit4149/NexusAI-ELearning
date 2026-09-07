import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Code2, Loader2, ArrowLeft, CheckCircle, Clock, Zap, ChevronRight } from 'lucide-react';

const difficultyColors = {
  easy: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  medium: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
  hard: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
};

const languageColors = {
  javascript: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
  python: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
  java: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
  'c++': 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
  go: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/20',
};

const CourseChallenges = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, challengesRes] = await Promise.all([
          axios.get(`/api/courses/${courseId}`, { headers: getAuthHeader() }),
          axios.get(`/api/code/course/${courseId}`, { headers: getAuthHeader() })
        ]);
        setCourse(courseRes.data.data);
        setChallenges(challengesRes.data.data);
      } catch (err) {
        toast.error('Failed to load challenges');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
      {/* Back link */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 text-sm transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm">
              <Code2 size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Coding Challenges</h1>
          </div>
          {course && (
            <p className="text-slate-500 dark:text-slate-400 text-sm ml-14">
              {course.title} · {challenges.length} challenges
            </p>
          )}
        </div>
      </div>

      {challenges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Code2 size={52} className="text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Challenges Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            The instructor hasn't added any coding challenges to this course yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge, idx) => (
            <Link
              key={challenge._id}
              to={`/coding/${challenge._id}`}
              className="group flex items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-5">
                {/* Index number */}
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {idx + 1}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {challenge.description?.slice(0, 80)}...
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${languageColors[challenge.language] || 'bg-slate-100 text-slate-600'}`}>
                      {challenge.language}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock size={11} /> {challenge.testCases?.length || 0} test cases
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary">
                  Solve <ChevronRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseChallenges;
