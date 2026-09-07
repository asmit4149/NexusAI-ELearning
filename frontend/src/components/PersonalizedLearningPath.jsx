import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Brain, BookOpen, Target, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, ChevronRight, Loader2,
  Zap, BarChart2, ArrowRight, Award
} from 'lucide-react';

const difficultyColors = {
  Beginner: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', badge: 'bg-green-500' },
  Intermediate: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-500' },
  Advanced: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', badge: 'bg-red-500' },
};

const ScoreBar = ({ score, label }) => {
  const color = score >= 85 ? 'bg-green-500' : score >= 65 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-semibold">{score}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

const PersonalizedLearningPath = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/adaptive/learning-path', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your learning path.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLearningPath();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex justify-center items-center min-h-40">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-sm">Analyzing your learning data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 p-6 text-center text-red-600 dark:text-red-400 text-sm">
        <AlertTriangle className="mx-auto mb-2" size={24} />
        {error}
      </div>
    );
  }

  if (!data || data.performanceSummary.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center">
        <Brain className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
        <h3 className="font-semibold text-slate-700 dark:text-slate-300">No Learning Data Yet</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enroll in courses and take quizzes to see your personalized learning path.</p>
      </div>
    );
  }

  const { performanceSummary, weakTopics, nextLessons, recommendedDifficulty } = data;
  const diffStyle = difficultyColors[recommendedDifficulty] || difficultyColors.Beginner;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow">
            <Brain size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personalized Learning Path</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI-analyzed based on your quiz scores, progress & weak topics</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${diffStyle.bg} ${diffStyle.text}`}>
          <Zap size={12} />
          Recommended: {recommendedDifficulty}
        </div>
      </div>

      {/* Course Performance Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {performanceSummary.map((course) => (
          <div key={course.courseId} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">{course.courseTitle}</h3>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">{course.courseCategory}</span>
              </div>
              <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                course.status === 'Completed'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              }`}>
                {course.status}
              </span>
            </div>

            {/* Progress Bar */}
            <ScoreBar score={course.progress} label="Course Progress" />

            {/* Quiz Score */}
            {course.avgQuizScore !== null ? (
              <ScoreBar score={course.avgQuizScore} label={`Avg Quiz Score (${course.totalAttempts} attempts)`} />
            ) : (
              <p className="text-xs text-slate-400 italic">No quiz attempts yet for this course.</p>
            )}

            {/* Accuracy */}
            {course.accuracy !== null && (
              <ScoreBar score={course.accuracy} label="Answer Accuracy" />
            )}

            {/* Failed quizzes hint */}
            {course.failedQuizzes.length > 0 && (
              <div className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                <span>Needs revision: <span className="font-semibold">{course.failedQuizzes[0]}</span></span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Weak Topics */}
      {weakTopics.length > 0 && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-5">
          <h3 className="flex items-center gap-2 font-semibold text-red-800 dark:text-red-300 mb-4 text-sm">
            <TrendingDown size={16} />
            Weak Topics Detected — Revision Recommended
          </h3>
          <div className="space-y-3">
            {weakTopics.map((weak, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-red-100 dark:border-red-900/20">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-sm">
                  {Math.round(weak.score)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 dark:text-white text-sm truncate">{weak.topic}</span>
                    <span className="text-[10px] text-slate-400">{weak.courseTitle}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{weak.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Lessons */}
      {nextLessons.length > 0 && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/10 p-5">
          <h3 className="flex items-center gap-2 font-semibold text-indigo-800 dark:text-indigo-300 mb-4 text-sm">
            <TrendingUp size={16} />
            Continue Learning — Next Recommended Lessons
          </h3>
          <div className="space-y-3">
            {nextLessons.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-indigo-900/20 hover:shadow-sm transition-shadow">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{item.lessonTitle}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.courseTitle} • Lesson {item.lessonOrder}</p>
                  {item.lessonDescription && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.lessonDescription}</p>
                  )}
                </div>
                <div className="flex-shrink-0 flex items-center gap-1.5">
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{item.progress}%</span>
                  <ChevronRight size={16} className="text-indigo-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Status — all courses completed */}
      {weakTopics.length === 0 && nextLessons.length === 0 && performanceSummary.length > 0 && (
        <div className="rounded-xl border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 p-5 flex items-center gap-4">
          <CheckCircle size={32} className="text-green-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-200">You're all caught up!</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">All enrolled courses are complete or have no weak topics. Great job! Explore new courses to keep growing.</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default PersonalizedLearningPath;
