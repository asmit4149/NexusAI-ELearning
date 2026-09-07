import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

// Prevent user from leaving more than one review per course
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

// Static method to get average rating and save to course
reviewSchema.statics.getAverageRating = async function (courseId) {
  const obj = await this.aggregate([
    {
      $match: { course: courseId }
    },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('Course').findByIdAndUpdate(courseId, {
      rating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0,
      totalReviews: obj[0] ? obj[0].totalReviews : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.course);
});

// Call getAverageRating before remove (mongoose 7+)
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.getAverageRating(this.course);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
