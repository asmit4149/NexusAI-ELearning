import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Brain, Sparkles, BookOpen, ChevronDown, ChevronUp, Loader2,
  CheckCircle, Edit3, Trash2, Send, RefreshCw, Eye, EyeOff,
  Plus, AlertTriangle, CheckSquare, List, AlignLeft
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const typeIcons = {
  MCQ: <List size={14} />,
  TrueFalse: <CheckSquare size={14} />,
  ShortAnswer: <AlignLeft size={14} />,
  Mixed: <Sparkles size={14} />,
};

// ──────────────────────────────────────────────
// Generator Form
// ──────────────────────────────────────────────
const GeneratorForm = ({ onGenerated }) => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    courseId: '',
    title: '',
    customTopic: '',
    difficulty: 'Medium',
    questionType: 'MCQ',
    numQuestions: 5,
    timeLimit: 15,
    passingScore: 80,
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    axios.get('/api/courses', { headers: getAuthHeader() })
      .then(res => setCourses(res.data.data?.courses || []))
      .catch(err => console.error('Failed to fetch courses', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.courseId) { toast.error('Please select a course'); return; }

    setGenerating(true);
    try {
      const payload = {
        title: form.title,
        customTopic: form.customTopic,
        difficulty: form.difficulty,
        questionType: form.questionType,
        numQuestions: Number(form.numQuestions),
        timeLimit: Number(form.timeLimit),
        passingScore: Number(form.passingScore),
      };
      const { data } = await axios.post(`/api/quizzes/generate/${form.courseId}`, payload, {
        headers: getAuthHeader()
      });
      toast.success('Quiz generated! Review it below.');
      onGenerated(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const fieldClass = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelClass = "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide";

  return (
    <form onSubmit={handleGenerate} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Course */}
        <div className="sm:col-span-2">
          <label className={labelClass}>Course *</label>
          <select name="courseId" value={form.courseId} onChange={handleChange} className={fieldClass} required>
            <option value="">Select a course...</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>

        {/* Quiz Title */}
        <div>
          <label className={labelClass}>Quiz Title (optional)</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Leave blank to auto-generate" className={fieldClass} />
        </div>

        {/* Custom Topic */}
        <div>
          <label className={labelClass}>Custom Topic (optional)</label>
          <input name="customTopic" value={form.customTopic} onChange={handleChange} placeholder="e.g. Neural Networks, SQL Joins..." className={fieldClass} />
        </div>

        {/* Difficulty */}
        <div>
          <label className={labelClass}>Difficulty</label>
          <select name="difficulty" value={form.difficulty} onChange={handleChange} className={fieldClass}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        {/* Question Type */}
        <div>
          <label className={labelClass}>Question Type</label>
          <select name="questionType" value={form.questionType} onChange={handleChange} className={fieldClass}>
            <option value="MCQ">MCQ (Multiple Choice)</option>
            <option value="TrueFalse">True / False</option>
            <option value="ShortAnswer">Short Answer</option>
            <option value="Mixed">Mixed (All types)</option>
          </select>
        </div>

        {/* Num Questions */}
        <div>
          <label className={labelClass}>Number of Questions</label>
          <input type="number" name="numQuestions" value={form.numQuestions} onChange={handleChange} min={1} max={20} className={fieldClass} />
        </div>

        {/* Time Limit */}
        <div>
          <label className={labelClass}>Time Limit (minutes)</label>
          <input type="number" name="timeLimit" value={form.timeLimit} onChange={handleChange} min={1} max={120} className={fieldClass} />
        </div>

        {/* Passing Score */}
        <div>
          <label className={labelClass}>Passing Score (%)</label>
          <input type="number" name="passingScore" value={form.passingScore} onChange={handleChange} min={1} max={100} className={fieldClass} />
        </div>
      </div>

      <button
        type="submit"
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {generating ? (
          <><Loader2 size={18} className="animate-spin" /> Generating with AI...</>
        ) : (
          <><Sparkles size={18} /> Generate Quiz</>
        )}
      </button>
    </form>
  );
};

// ──────────────────────────────────────────────
// Question Card (editable)
// ──────────────────────────────────────────────
const QuestionCard = ({ question, index, onChange, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({ ...question });

  const handleSave = () => {
    onChange(index, local);
    setEditing(false);
  };

  const typeLabel = question.type || 'MCQ';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
            {index + 1}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                {typeIcons[typeLabel]} {typeLabel}
              </span>
            </div>
            {editing ? (
              <textarea
                value={local.question}
                onChange={e => setLocal(p => ({ ...p, question: e.target.value }))}
                rows={2}
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-sm text-slate-800 dark:text-slate-200">{question.question}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {editing ? (
            <button onClick={handleSave} className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 transition-colors">
              <CheckCircle size={16} />
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
              <Edit3 size={16} />
            </button>
          )}
          <button onClick={() => onDelete(index)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Options */}
      {question.options && question.options.length > 0 && (
        <div className="px-4 pb-2 grid grid-cols-2 gap-2">
          {(editing ? local.options : question.options).map((opt, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs rounded-lg px-3 py-1.5 ${
              opt === (editing ? local.correctAnswer : question.correctAnswer)
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {editing ? (
                <input
                  className="bg-transparent flex-1 focus:outline-none"
                  value={opt}
                  onChange={e => {
                    const newOpts = [...local.options];
                    newOpts[i] = e.target.value;
                    setLocal(p => ({ ...p, options: newOpts }));
                  }}
                />
              ) : (
                <span>{opt}</span>
              )}
              {opt === (editing ? local.correctAnswer : question.correctAnswer) && <CheckCircle size={12} />}
            </div>
          ))}
        </div>
      )}

      {/* Correct Answer (ShortAnswer) */}
      {typeLabel === 'ShortAnswer' && (
        <div className="px-4 pb-2">
          <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Answer:</div>
          {editing ? (
            <input value={local.correctAnswer} onChange={e => setLocal(p => ({ ...p, correctAnswer: e.target.value }))}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-slate-800 dark:text-white focus:outline-none" />
          ) : (
            <span className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg inline-block">{question.correctAnswer}</span>
          )}
        </div>
      )}

      {/* Explanation */}
      <div className="px-4 pb-4">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1 mt-1">Explanation</div>
        {editing ? (
          <textarea value={local.explanation} onChange={e => setLocal(p => ({ ...p, explanation: e.target.value }))}
            rows={2}
            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-600 dark:text-slate-400 focus:outline-none" />
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">{question.explanation}</p>
        )}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Review Panel
// ──────────────────────────────────────────────
const ReviewPanel = ({ quiz: initial, onPublished, onDiscard }) => {
  const [quiz, setQuiz] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleQuestionChange = (index, updated) => {
    const qs = [...quiz.questions];
    qs[index] = updated;
    setQuiz(p => ({ ...p, questions: qs }));
  };

  const handleDelete = (index) => {
    setQuiz(p => ({ ...p, questions: p.questions.filter((_, i) => i !== index) }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/quizzes/${quiz._id}`, { questions: quiz.questions, title: quiz.title }, { headers: getAuthHeader() });
      toast.success('Draft saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (quiz.questions.length === 0) { toast.error('A quiz must have at least 1 question'); return; }
    setPublishing(true);
    try {
      // Save any edits first
      await axios.put(`/api/quizzes/${quiz._id}`, { questions: quiz.questions, title: quiz.title }, { headers: getAuthHeader() });
      // Then publish
      await axios.patch(`/api/quizzes/${quiz._id}/publish`, {}, { headers: getAuthHeader() });
      toast.success('Quiz published successfully! Students can now take it.');
      onPublished();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 p-4">
        <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Review before publishing</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">This quiz is saved as a Draft. Review and edit questions below, then publish when ready. Students cannot see drafts.</p>
        </div>
      </div>

      {/* Title Edit */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Quiz Title</label>
        <input
          value={quiz.title}
          onChange={e => setQuiz(p => ({ ...p, title: e.target.value }))}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{quiz.questions.length} Questions</span>
        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{quiz.difficulty}</span>
        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{quiz.questionType}</span>
        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{quiz.timeLimit} min</span>
        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full font-semibold">Draft</span>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {quiz.questions.map((q, idx) => (
          <QuestionCard
            key={idx}
            question={q}
            index={idx}
            onChange={handleQuestionChange}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button onClick={onDiscard} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw size={15} /> Generate New
        </button>
        <button onClick={handleSaveDraft} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/30 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Edit3 size={15} />} Save Draft
        </button>
        <button onClick={handlePublish} disabled={publishing} className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold shadow hover:opacity-90 transition-opacity disabled:opacity-60">
          {publishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Publish Quiz
        </button>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Existing Drafts List
// ──────────────────────────────────────────────
const DraftsList = ({ onResume }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/quizzes/drafts', { headers: getAuthHeader() })
      .then(res => setDrafts(res.data.data || []))
      .catch(() => setDrafts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-slate-400 py-2">Loading drafts...</div>;
  if (drafts.length === 0) return <div className="text-xs text-slate-400 italic py-2">No existing drafts.</div>;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Existing Drafts</h4>
      {drafts.map(draft => (
        <div key={draft._id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{draft.title}</p>
            <p className="text-xs text-slate-400">{draft.course?.title} • {draft.questions?.length} questions • {draft.difficulty}</p>
          </div>
          <button onClick={() => onResume(draft)} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
            <Eye size={13} /> Review
          </button>
        </div>
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────
const QuizGeneratorPage = () => {
  const { user } = useContext(AuthContext);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [published, setPublished] = useState(false);

  // Guard: only instructors/admins
  if (!user || (user.role !== 'Instructor' && user.role !== 'Admin')) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center p-8 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
        <AlertTriangle size={36} className="text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Access Denied</h2>
        <p className="text-sm text-red-600 dark:text-red-400">Only Instructors and Admins can use the AI Quiz Generator.</p>
      </div>
    );
  }

  const handlePublished = () => {
    setPublished(true);
    setGeneratedQuiz(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow">
            <Brain size={22} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Quiz Generator</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm ml-14">
          Generate, review, and publish intelligent quizzes for your courses using Gemini AI.
        </p>
      </div>

      {published && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 p-4">
          <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-800 dark:text-green-300 font-semibold">Quiz published! Students can now take it from the course page.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left — Form / Review */}
        <div className="lg:col-span-2">
          {!generatedQuiz ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={18} className="text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Generate New Quiz</h2>
              </div>
              <GeneratorForm onGenerated={(quiz) => { setGeneratedQuiz(quiz); setPublished(false); }} />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Eye size={18} className="text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Review Quiz</h2>
              </div>
              <ReviewPanel
                quiz={generatedQuiz}
                onPublished={handlePublished}
                onDiscard={() => setGeneratedQuiz(null)}
              />
            </div>
          )}
        </div>

        {/* Right — Drafts */}
        <div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">My Draft Quizzes</h3>
            </div>
            <DraftsList onResume={(draft) => { setGeneratedQuiz(draft); setPublished(false); }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGeneratorPage;
