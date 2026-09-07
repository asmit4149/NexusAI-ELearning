import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Star, Send, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const ReviewSection = ({ courseId }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/courses/${courseId}/reviews`);
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    
    setSubmitting(true);
    try {
      const { data } = await axios.post(`/api/courses/${courseId}/reviews`, {
        rating,
        comment
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // assuming token is in localStorage
        }
      });
      
      if (data.success) {
        toast.success('Review added successfully');
        setComment('');
        setRating(5);
        fetchReviews(); // refresh
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to submit review';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mt-8">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Student Reviews</h3>
      
      {/* Add Review Form */}
      {user && user.role === 'Student' && (
        <form onSubmit={handleSubmit} className="mb-10 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Leave a Review</h4>
          
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">Rating:</span>
            <div className="flex space-x-1 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={24}
                  onClick={() => setRating(star)}
                  className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'} hover:scale-110 transition-transform`}
                />
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <textarea
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              placeholder="What did you think about this course?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            {submitting ? 'Submitting...' : (
              <>
                <Send size={18} className="mr-2" />
                Submit Review
              </>
            )}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full p-2 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-white">{review.user?.name || 'Anonymous User'}</h5>
                    <div className="flex items-center text-xs text-slate-500">
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < review.rating ? "fill-yellow-400" : "text-slate-300 dark:text-slate-700"} />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mt-3">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
            <Star className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
            <p>No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
