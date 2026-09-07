import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, Send, User, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';

// Construct socket URL based on API URL, stripping off '/api' if it exists
const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
  : 'http://localhost:5000';

const ForumSection = ({ courseId }) => {
  const { user } = useContext(AuthContext);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedThread, setExpandedThread] = useState(null);
  const [replies, setReplies] = useState({});
  const [newReplyContent, setNewReplyContent] = useState('');
  
  const socketRef = useRef();

  useEffect(() => {
    // 1. Initialize Socket Connection
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    // 2. Join the specific course room
    if (courseId) {
      socketRef.current.emit('join_course', courseId);
    }

    // 3. Listen for incoming real-time messages
    socketRef.current.on('receive_message', (data) => {
      if (data.type === 'NEW_THREAD') {
        setThreads((prev) => [data.thread, ...prev]);
        toast.success(`New discussion started by ${data.thread.user.name}`, { icon: '💬' });
      } else if (data.type === 'NEW_REPLY') {
        const { threadId, reply } = data;
        setReplies((prev) => ({
          ...prev,
          [threadId]: [...(prev[threadId] || []), reply]
        }));
        setThreads((prev) => 
          prev.map(t => t._id === threadId ? { ...t, repliesCount: t.repliesCount + 1 } : t)
        );
        // Only toast if it's not the current user who sent it
        if (reply.user.name !== user?.name) {
          toast(`New reply from ${reply.user.name}`, { icon: '🔔' });
        }
      }
    });

    // Load initial dummy data
    setThreads([
      {
        _id: '1',
        title: 'How does Gradient Descent work in this context?',
        content: 'I am a bit confused by the learning rate parameter mentioned in video 3.',
        user: { name: 'Alex M.' },
        repliesCount: 2,
        createdAt: new Date().toISOString()
      }
    ]);
    setLoading(false);

    // Cleanup on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [courseId, user?.name]);

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      toast.error('Title and content are required');
      return;
    }
    
    setSubmitting(true);
    
    const newThread = {
      _id: Date.now().toString(),
      title: newThreadTitle,
      content: newThreadContent,
      user: { name: user?.name || 'You' },
      repliesCount: 0,
      createdAt: new Date().toISOString()
    };

    // Emit to Socket.io Server
    socketRef.current.emit('send_message', {
      courseId,
      type: 'NEW_THREAD',
      thread: newThread
    });

    setNewThreadTitle('');
    setNewThreadContent('');
    setSubmitting(false);
  };

  const toggleThread = (threadId) => {
    if (expandedThread === threadId) {
      setExpandedThread(null);
    } else {
      setExpandedThread(threadId);
      if (!replies[threadId] && threadId === '1') {
        setReplies(prev => ({
          ...prev,
          [threadId]: [
            { _id: 'r1', content: 'You need to decrease the learning rate if it overshoots.', user: { name: 'Instructor Bob' }, createdAt: new Date().toISOString() }
          ]
        }));
      }
    }
  };

  const handleReply = (e, threadId) => {
    e.preventDefault();
    if (!newReplyContent.trim()) return;

    const newReply = {
      _id: Date.now().toString(),
      content: newReplyContent,
      user: { name: user?.name || 'You' },
      createdAt: new Date().toISOString()
    };

    // Emit to Socket.io Server
    socketRef.current.emit('send_message', {
      courseId,
      type: 'NEW_REPLY',
      threadId,
      reply: newReply
    });

    setNewReplyContent('');
  };

  if (loading) return <div className="animate-pulse h-40 bg-slate-100 rounded-2xl mt-8"></div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mt-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        LIVE CHAT
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
          <MessageCircle className="mr-3 text-primary" size={28} />
          Course Discussion Forum
        </h3>
      </div>

      {user && (
        <form onSubmit={handleCreateThread} className="mb-8 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800 transition-all focus-within:shadow-md focus-within:border-primary/30">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Start a new discussion</h4>
          <input
            type="text"
            placeholder="Discussion Title"
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm transition-all"
          />
          <textarea
            placeholder="What's on your mind?"
            rows="3"
            value={newThreadContent}
            onChange={(e) => setNewThreadContent(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm transition-all"
          ></textarea>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm disabled:opacity-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              {submitting ? 'Posting...' : <><Send size={16} className="mr-2" /> Post Thread</>}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {threads.map(thread => (
          <div key={thread._id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all hover:border-primary/30">
            <div 
              className="p-4 bg-white dark:bg-slate-800/80 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex justify-between items-start"
              onClick={() => toggleThread(thread._id)}
            >
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-lg">{thread.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-medium text-primary">{thread.user.name}</span>
                  <span>•</span>
                  <span>{new Date(thread.createdAt).toLocaleTimeString()}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12}/> {thread.repliesCount} replies</span>
                </div>
              </div>
              <div className="text-slate-400">
                {expandedThread === thread._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {expandedThread === thread._id && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-slate-700 dark:text-slate-300 text-sm mb-6">{thread.content}</p>
                
                <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-4 mb-4">
                  {(replies[thread._id] || []).map(reply => (
                    <div key={reply._id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{reply.user.name}</span>
                        <span className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{reply.content}</p>
                    </div>
                  ))}
                </div>

                {user && (
                  <form onSubmit={(e) => handleReply(e, thread._id)} className="flex gap-2 mt-4">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={newReplyContent}
                      onChange={(e) => setNewReplyContent(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary dark:text-white transition-all focus:shadow-md"
                    />
                    <button type="submit" className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm transition-all font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5">
                      Reply
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumSection;
