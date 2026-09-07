import { BookOpen, Clock, Star } from 'lucide-react';
import PaymentButton from './PaymentButton';

const CourseCard = ({ courseId, title, description, instructor, duration, rating, image, price = 49.99 }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-primary-500 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-primary-500">
      <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">{title}</h3>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <BookOpen size={14} className="text-primary-500" />
            <span>{instructor}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1 font-medium text-amber-500">
              <Star size={14} className="fill-amber-500" />
              <span>{rating}</span>
            </div>
          </div>
        </div>
        
        {courseId && (
          <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
            <PaymentButton courseId={courseId} coursePrice={price} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
