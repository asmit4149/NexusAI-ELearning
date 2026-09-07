import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, BookOpen, Clock, Star, PlayCircle, ShieldCheck } from 'lucide-react';
import PaymentButton from '../components/PaymentButton';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(`/api/courses/${courseId}`);
        setCourse(data.data);
      } catch (error) {
        console.error('Failed to fetch course details', error);
        toast.error('Course not found');
        navigate('/recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, navigate]);

  const handleEnrollFree = async () => {
    try {
      setEnrolling(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/courses/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Successfully enrolled!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 text-sm transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl overflow-hidden glass-panel p-8 relative">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary-500/10 blur-[80px]"></div>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {course.category}
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {course.level}
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              {course.title}
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Star className="text-amber-500" size={18} fill="currentColor" />
                <span className="font-bold text-slate-700 dark:text-slate-300">{course.rating || 'New'}</span>
                <span>({course.totalReviews || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={18} />
                <span>{course.lessons?.length || 0} Lessons</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">What you'll learn</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-slate-600 dark:text-slate-300">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <ShieldCheck className="text-green-500 shrink-0 mt-0.5" size={20} />
                  <span>Master the core concepts and practical applications of this topic.</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Enrollment */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl sticky top-24">
            <div className="aspect-video rounded-xl overflow-hidden mb-6 relative group">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="text-white opacity-80" size={64} />
              </div>
            </div>

            <div className="text-3xl font-black text-slate-900 dark:text-white mb-6">
              {course.price === 0 ? 'Free' : `$${course.price}`}
            </div>

            {course.price === 0 || course.accessType === 'free' ? (
              <button
                onClick={handleEnrollFree}
                disabled={enrolling}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-600 disabled:opacity-70 flex justify-center"
              >
                {enrolling ? <Loader2 className="animate-spin" size={20} /> : 'Enroll Now for Free'}
              </button>
            ) : (
              <PaymentButton courseId={course._id} coursePrice={course.price} onSuccess={() => navigate('/dashboard')} />
            )}

            <p className="text-xs text-center text-slate-500 mt-4">
              Full lifetime access • Access on mobile and TV • Certificate of completion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
