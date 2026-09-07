import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, Code2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateChallenge = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    language: 'javascript',
    starterCode: '',
    testCases: [{ input: '', expectedOutput: '', isHidden: false }]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'Instructor' && user.role !== 'Admin')) {
      toast.error('Unauthorized');
      navigate('/');
      return;
    }
    
    // Fetch instructor's courses
    axios.get('/api/courses/my-courses', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setCourses(res.data.data))
    .catch(err => console.error(err));
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index][field] = value;
    setFormData({ ...formData, testCases: newTestCases });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', expectedOutput: '', isHidden: false }]
    });
  };

  const removeTestCase = (index) => {
    const newTestCases = formData.testCases.filter((_, i) => i !== index);
    setFormData({ ...formData, testCases: newTestCases });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseId) return toast.error('Please select a course');
    if (formData.testCases.length === 0) return toast.error('Add at least one test case');

    setLoading(true);
    try {
      await axios.post('/api/code/challenge', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Coding challenge created successfully!');
      navigate('/dashboard'); // or back to course
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Code2 size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Coding Challenge</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Challenge Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className={inputClass} placeholder="e.g. Two Sum" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Course</label>
              <select name="courseId" required value={formData.courseId} onChange={handleChange} className={inputClass}>
                <option value="">Select a Course...</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description / Problem Statement</label>
            <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className={inputClass} placeholder="Describe the problem, input format, output format, and constraints..."></textarea>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Language</label>
              <select name="language" value={formData.language} onChange={handleChange} className={inputClass}>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="java">Java</option>
                <option value="c++">C++</option>
                <option value="go">Go</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Starter Code (Optional)</label>
              <textarea name="starterCode" rows="4" value={formData.starterCode} onChange={handleChange} className={`${inputClass} font-mono text-xs`} placeholder={`function solve(input) {\n  // your code here\n}`}></textarea>
            </div>
          </div>

          {/* Test Cases Section */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Test Cases</h3>
              <button type="button" onClick={addTestCase} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-700 dark:hover:text-primary-400">
                <Plus size={16} /> Add Case
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.testCases.map((tc, idx) => (
                <div key={idx} className="relative p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  {formData.testCases.length > 1 && (
                    <button type="button" onClick={() => removeTestCase(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                  <h4 className="text-sm font-semibold text-slate-500 mb-3">Test Case #{idx + 1}</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Standard Input (stdin)</label>
                      <textarea required rows="2" value={tc.input} onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)} className={`${inputClass} font-mono text-xs`} placeholder="e.g. 5 10"></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Expected Output (stdout)</label>
                      <textarea required rows="2" value={tc.expectedOutput} onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)} className={`${inputClass} font-mono text-xs`} placeholder="e.g. 15"></textarea>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <input type="checkbox" id={`hidden-${idx}`} checked={tc.isHidden} onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" />
                    <label htmlFor={`hidden-${idx}`} className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">Hide this test case from students</label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3 font-bold text-white shadow-md hover:opacity-90 disabled:opacity-60 transition-opacity">
              {loading ? 'Saving...' : <><Save size={18} /> Create Challenge</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChallenge;
