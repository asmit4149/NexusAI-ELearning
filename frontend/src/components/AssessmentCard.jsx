import { Target, Award, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const AssessmentCard = ({ title, category, difficulty, duration, questionsCount }) => {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-800">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <div className="rounded-xl bg-primary-50 p-3 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400">
            <Target size={24} />
          </div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {difficulty}
          </span>
        </div>
        
        <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mb-4 text-sm font-medium text-primary-600 dark:text-primary-400">{category}</p>
        
        <div className="mb-6 flex gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Award size={16} />
            <span>{questionsCount} Qs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target size={16} />
            <span>{duration} min</span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => toast.success(`Starting ${title} Assessment!`)}
        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
      >
        Start Assessment
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};

export default AssessmentCard;
