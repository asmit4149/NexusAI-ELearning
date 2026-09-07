import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User, Loader2, BookOpen, ChevronDown, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const WELCOME_MESSAGE = { id: 'welcome', text: "Hi! I'm your NexusAI Tutor. Select a course from the dropdown to ask me context-aware questions, or speak to me directly!", isBot: true };

const AIChatbot = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Voice AI States
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        // Automatically send after speaking
        handleSendEvent(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, [selectedCourse]); // re-bind closure if needed

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // stop any playing audio first
      window.speechSynthesis.cancel();
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Stop current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Remove markdown symbols for cleaner speech
    utterance.text = text.replace(/[*_#]/g, ''); 
    utterance.rate = 1.05;
    utterance.pitch = 1;
    
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.lang === 'en-US');
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchEnrolledCourses();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchChatHistory(selectedCourse._id);
    } else {
      setMessages([WELCOME_MESSAGE]);
    }
  }, [selectedCourse]);

  const fetchEnrolledCourses = async () => {
    try {
      const { data } = await axios.get('/api/users/my-enrollments', {
        headers: getAuthHeader()
      });
      if (data.success) {
        setEnrolledCourses(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
    }
  };

  const fetchChatHistory = async (courseId) => {
    setLoadingHistory(true);
    try {
      const { data } = await axios.get(`/api/ai/chat/${courseId}/history`, {
        headers: getAuthHeader()
      });

      if (data.success && data.data && data.data.length > 0) {
        const historyMessages = data.data.map((msg, idx) => ({
          id: `hist-${idx}-${msg.role}`,
          text: msg.text,
          isBot: msg.role === 'model',
          timestamp: msg.timestamp
        }));
        setMessages([
          {
            id: 'context-note',
            text: `📚 Loaded chat history for **${selectedCourse.title}**. I have full context of this course's content!`,
            isBot: true
          },
          ...historyMessages
        ]);
      } else {
        setMessages([{
          id: 'context-note',
          text: `📚 Context set to **${selectedCourse?.title}**. Ask me anything about this course — lessons, concepts, or examples!`,
          isBot: true
        }]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([WELCOME_MESSAGE]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendEvent = async (textToSend) => {
    if (!textToSend.trim() || isTyping) return;

    window.speechSynthesis.cancel(); // Stop speaking when user sends a new message

    const userMsg = { id: Date.now(), text: textToSend, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const payload = { message: textToSend };
      if (selectedCourse) payload.courseId = selectedCourse._id;

      const { data } = await axios.post('/api/ai/chat', payload, {
        headers: getAuthHeader()
      });

      const responseText = data.data;
      setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, isBot: true }]);
      
      // Trigger voice output
      speakText(responseText);

    } catch (error) {
      console.error('Chat error:', error);
      const errMsg = error.response?.data?.message || 'Sorry, I am having trouble connecting right now.';
      setMessages(prev => [...prev, { id: Date.now() + 1, text: errMsg, isBot: true }]);
      speakText(errMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    handleSendEvent(input);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCourseDropdownOpen(false);
  };

  const handleClearCourse = () => {
    setSelectedCourse(null);
    setCourseDropdownOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 p-4 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 z-50 ${isOpen ? 'hidden' : 'flex'} items-center gap-2`}
        aria-label="Open AI Tutor"
      >
        <MessageSquare size={24} />
      </button>

      <div
        className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[560px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">NexusAI Personal Tutor</h3>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                {selectedCourse ? `Context: ${selectedCourse.title.substring(0, 22)}...` : 'General Mode'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (voiceEnabled) window.speechSynthesis.cancel();
              }} 
              className={`p-1.5 rounded-md transition-colors ${voiceEnabled ? 'text-white hover:bg-white/20' : 'text-blue-300 hover:bg-white/10'}`}
              title={voiceEnabled ? 'Mute AI Voice' : 'Unmute AI Voice'}
            >
              {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-md transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Course Selector */}
        {user && (
          <div className="relative px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
            <button
              onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 text-xs px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
                <BookOpen size={14} className="text-primary flex-shrink-0" />
                <span className="truncate">{selectedCourse ? selectedCourse.title : 'Select a course for smart context...'}</span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${courseDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {courseDropdownOpen && (
              <div className="absolute top-full left-3 right-3 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden max-h-48 overflow-y-auto">
                {selectedCourse && (
                  <button
                    onClick={handleClearCourse}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700"
                  >
                    ✕ General Mode (no context)
                  </button>
                )}
                {enrolledCourses.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500 text-center">
                    No enrolled courses found.
                  </div>
                ) : (
                  enrolledCourses.map(course => (
                    <button
                      key={course._id}
                      onClick={() => handleCourseSelect(course)}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors ${selectedCourse?._id === course._id ? 'bg-blue-50 dark:bg-blue-900/20 text-primary font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      <div className="font-medium truncate">{course.title}</div>
                      <div className="text-slate-400 text-[10px]">{course.category}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" onClick={() => setCourseDropdownOpen(false)}>
          {loadingHistory ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xs">Loading conversation history...</span>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex max-w-[85%] gap-2 ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="flex-shrink-0 mt-1">
                    {msg.isBot ? (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                        <Bot size={14} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                  <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.isBot
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                  <Bot size={14} />
                </div>
                <div className="px-4 py-2.5 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex-shrink-0">
          {!user && (
            <p className="text-xs text-center text-slate-400 mb-2">Log in to save your conversation history.</p>
          )}
          <form onSubmit={handleSend} className="flex gap-2 relative">
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isListening ? 'text-red-500 bg-red-100 dark:bg-red-900/30 animate-pulse' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              title={isListening ? "Stop listening" : "Speak your question"}
            >
              {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : (selectedCourse ? `Ask about ${selectedCourse.title.substring(0, 15)}...` : 'Ask anything...')}
              className={`flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white placeholder-slate-400 ${isListening ? 'border-red-300 ring-1 ring-red-300' : ''}`}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0 shadow-sm"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIChatbot;
