import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { 
  Play, Send, ArrowLeft, CheckCircle, XCircle, 
  Terminal, Loader2, AlertTriangle, Code2, Sparkles, Bot
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const CodingWorkspace = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'results', 'ai'
  
  const [hintLoading, setHintLoading] = useState(false);
  const [aiHint, setAiHint] = useState(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const { data } = await axios.get(`/api/code/challenge/${challengeId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setChallenge(data.data.challenge);
        
        // Load past submission or starter code
        if (data.data.lastSubmission) {
          setCode(data.data.lastSubmission.code);
          setSubmissionResult(data.data.lastSubmission);
          setActiveTab('results');
        } else {
          setCode(data.data.challenge.starterCode);
        }
      } catch (err) {
        toast.error('Failed to load challenge');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [challengeId, navigate]);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const submitCode = async () => {
    setSubmitting(true);
    setSubmissionResult(null);
    setActiveTab('results');
    try {
      const { data } = await axios.post(`/api/code/submit/${challengeId}`, { code }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSubmissionResult(data.data);
      if (data.data.status === 'Passed') toast.success('All test cases passed!');
      else if (data.data.status === 'Error') toast.error('Execution Error');
      else toast.error('Some test cases failed');
    } catch (err) {
      toast.error('Failed to submit code');
    } finally {
      setSubmitting(false);
    }
  };

  const getAIHint = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }
    
    setHintLoading(true);
    setActiveTab('ai');
    try {
      const { data } = await axios.post('/api/ai/code-hint', {
        code,
        challengeDescription: challenge.description,
        language: challenge.language
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAiHint(data.data);
      toast.success('AI Hint generated!', { icon: '🤖' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to get AI hint');
      setAiHint('Sorry, the AI Tutor is currently unavailable.');
    } finally {
      setHintLoading(false);
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-300">
      {/* Header */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 font-bold text-white">
            <Code2 size={18} className="text-primary" />
            {challenge?.title}
          </div>
          <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 font-mono border border-slate-700">
            {challenge?.language}
          </span>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={getAIHint}
            disabled={hintLoading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 px-4 py-1.5 rounded text-sm font-semibold transition-all disabled:opacity-50"
            title="Ask AI for a hint based on your current code"
          >
            {hintLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-indigo-400" />}
            Get AI Hint
          </button>
          <button 
            onClick={submitCode} 
            disabled={submitting}
            className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-5 py-1.5 rounded text-sm font-semibold transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
            Run & Submit
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Description, Results & AI */}
        <div className="w-1/3 flex flex-col border-r border-slate-800 bg-[#0d1117] shrink-0 shadow-xl z-10">
          <div className="flex border-b border-slate-800 shrink-0 bg-slate-950/50">
            <button 
              onClick={() => setActiveTab('description')} 
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'description' ? 'border-primary text-white bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('results')} 
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex justify-center items-center gap-2 ${activeTab === 'results' ? 'border-primary text-white bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Test Results
              {submissionResult && (
                <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${submissionResult.status === 'Passed' ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'}`}></span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('ai')} 
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex justify-center items-center gap-2 ${activeTab === 'ai' ? 'border-indigo-500 text-indigo-300 bg-indigo-900/10' : 'border-transparent text-slate-500 hover:text-indigo-400/70'}`}
            >
              <Bot size={16} />
              AI Assistant
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
            {activeTab === 'description' && (
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed text-slate-300">{challenge?.description}</div>
                
                <h3 className="text-slate-200 font-bold mt-8 mb-4 border-b border-slate-800 pb-2">Sample Test Cases</h3>
                {challenge?.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                  <div key={idx} className="mb-4 rounded-lg bg-[#161b22] border border-slate-800 p-4 font-mono text-sm shadow-inner">
                    <div className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Input</div>
                    <div className="text-slate-300 mb-4 whitespace-pre-wrap bg-black/20 p-2 rounded">{tc.input}</div>
                    <div className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Output</div>
                    <div className="text-slate-300 whitespace-pre-wrap bg-black/20 p-2 rounded">{tc.expectedOutput}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'results' && (
              <div>
                {!submitting && !submissionResult && (
                  <div className="text-center text-slate-500 mt-20">
                    <Terminal size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Run your code to see results here.</p>
                  </div>
                )}
                
                {submitting && (
                  <div className="text-center text-primary mt-20">
                    <Loader2 size={32} className="animate-spin mx-auto mb-4" />
                    <p className="animate-pulse">Executing code securely...</p>
                  </div>
                )}

                {submissionResult && !submitting && (
                  <div className="animate-fade-in-up">
                    <div className={`p-4 rounded-lg mb-6 flex items-center justify-between border shadow-lg ${
                      submissionResult.status === 'Passed' ? 'bg-green-900/20 border-green-500/50 text-green-400' :
                      submissionResult.status === 'Error' ? 'bg-amber-900/20 border-amber-500/50 text-amber-400' :
                      'bg-red-900/20 border-red-500/50 text-red-400'
                    }`}>
                      <div className="flex items-center gap-3">
                        {submissionResult.status === 'Passed' ? <CheckCircle size={28} /> : 
                         submissionResult.status === 'Error' ? <AlertTriangle size={28} /> : 
                         <XCircle size={28} />}
                        <div>
                          <div className="font-bold text-lg tracking-wide">{submissionResult.status}</div>
                          <div className="text-sm opacity-80">Score: {submissionResult.score}%</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {submissionResult.testResults.map((tr, idx) => (
                        <div key={idx} className="border border-slate-800 rounded-lg overflow-hidden shadow-md">
                          <div className={`px-4 py-2 flex items-center justify-between text-sm font-bold border-b border-slate-800/50 ${tr.passed ? 'bg-green-900/10 text-green-400' : 'bg-red-900/10 text-red-400'}`}>
                            <span>Test Case {idx + 1} {tr.isHidden && '(Hidden)'}</span>
                            {tr.passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          </div>
                          
                          <div className="p-4 bg-[#161b22] font-mono text-xs space-y-3">
                            <div>
                              <div className="text-slate-500 mb-1 text-[10px] uppercase">Input</div>
                              <div className="bg-black/30 border border-slate-800 p-2 rounded whitespace-pre-wrap">{tr.input}</div>
                            </div>
                            
                            {!tr.passed && (
                              <>
                                <div>
                                  <div className="text-slate-500 mb-1 text-[10px] uppercase">Your Output</div>
                                  <div className="bg-red-950/20 border border-red-900/30 p-2 rounded whitespace-pre-wrap text-red-300">{tr.actualOutput || '<No output>'}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 mb-1 text-[10px] uppercase">Expected Output</div>
                                  <div className="bg-green-950/20 border border-green-900/30 p-2 rounded whitespace-pre-wrap text-green-300">{tr.expectedOutput}</div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="h-full">
                {!aiHint && !hintLoading && (
                  <div className="text-center text-slate-500 mt-20">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                      <Sparkles size={28} className="text-indigo-400" />
                    </div>
                    <h3 className="text-slate-300 font-semibold mb-2">AI Coding Assistant</h3>
                    <p className="text-sm max-w-xs mx-auto">
                      Stuck on this challenge? Write your best attempt in the editor and click "Get AI Hint" for guidance.
                    </p>
                  </div>
                )}
                
                {hintLoading && (
                  <div className="text-center text-indigo-400 mt-20 animate-fade-in-up">
                    <Loader2 size={40} className="animate-spin mx-auto mb-4" />
                    <p className="animate-pulse font-medium">Analyzing your code...</p>
                  </div>
                )}

                {aiHint && !hintLoading && (
                  <div className="animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-4 text-indigo-400 border-b border-slate-800 pb-3">
                      <Bot size={24} />
                      <h3 className="font-bold text-lg">AI Review</h3>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-slate-800 prose-a:text-indigo-400">
                      <ReactMarkdown>{aiHint}</ReactMarkdown>
                    </div>
                    <div className="mt-8 pt-4 border-t border-slate-800">
                      <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
                        <Sparkles size={12} /> AI hints are generated dynamically based on your current code.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          <Editor
            height="100%"
            language={challenge?.language === 'c++' ? 'cpp' : challenge?.language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontLigatures: true,
              padding: { top: 24 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              formatOnPaste: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CodingWorkspace;
