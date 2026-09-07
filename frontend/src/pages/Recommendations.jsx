import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Compass, TrendingUp, Sparkles, AlertCircle, PlayCircle, Star, ArrowRight } from 'lucide-react';

const difficultyColors = {
  Beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  Intermediate: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  Advanced: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const CourseCard = ({ course, isContinue = false, progress = 0 }) => (
  <Link to={`/courses/${course._id}`} className="group block h-full">
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all h-full flex flex-col">
      
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'} 
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur text-slate-800 dark:text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {course.category}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur ${difficultyColors[course.difficulty] || difficultyColors.Beginner}`}>
            {course.difficulty}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        
        {isContinue ? (
          <div className="mt-auto">
            <div className="flex justify-between text-xs mb-1 text-slate-500 dark:text-slate-400 font-semibold">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
               <Star className="text-amber-500 mr-1" size={16} fill="currentColor" />
               <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">4.8</span>
               <span>({course.enrolledStudents?.length || 0})</span>
             </div>
             <span className="font-bold text-primary text-sm">View Course</span>
          </div>
        )}
      </div>
    </div>
  </Link>
);

const Recommendations = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!data) return null;

  const { continueLearning, nextCourse, improveSkills, recommendedForYou } = data;

  const renderSection = (title, subtitle, icon, courses, isContinue = false) => {
    if (!courses || courses.length === 0) return null;

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-primary">
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard 
              key={course._id} 
              course={course} 
              isContinue={isContinue} 
              progress={isContinue ? course.progress : 0} 
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center space-y-3">
        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-2">
          <Sparkles size={14} /> AI Powered
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Your Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Hub</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          Personalized course recommendations tailored to your goals, performance, and current progress.
        </p>
      </div>

      {renderSection(
        'Continue Learning', 
        'Jump right back into your active courses', 
        <PlayCircle size={24} />, 
        continueLearning,
        true
      )}

      {renderSection(
        'Next Steps', 
        'Level up based on your completed courses', 
        <TrendingUp size={24} />, 
        nextCourse
      )}

      {renderSection(
        'Improve Your Skills', 
        'Courses targeted to strengthen your weak topics', 
        <AlertCircle size={24} className="text-amber-500" />, 
        improveSkills
      )}

      {renderSection(
        'Recommended For You', 
        'Top courses matching your interests', 
        <Compass size={24} />, 
        recommendedForYou
      )}

      {(!continueLearning?.length && !nextCourse?.length && !improveSkills?.length && !recommendedForYou?.length) && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Compass size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Recommendations Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            We need to learn more about you! Start enrolling in courses and taking quizzes so our AI can suggest the best paths for you.
          </p>
          <Link to="/courses" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-colors">
            Browse Catalog <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
