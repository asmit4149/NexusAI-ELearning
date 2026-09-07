import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Please add a course title'], 
      trim: true 
    },
    description: { 
      type: String, 
      required: [true, 'Please add a description'] 
    },
    category: { 
      type: String,
      required: [true, 'Please add a category'] 
    },
    level: {
      type: String,
      required: [true, 'Please add a level'],
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    thumbnail: { 
      type: String,
      default: 'no-photo.jpg'
    },
    accessType: {
      type: String,
      enum: ['free', 'premium', 'standalone'],
      default: 'premium',
    },
    price: { 
      type: Number,
      required: [true, 'Please add a price'],
      default: 0
    },
    instructor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    lessons: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Lesson' 
    }],
    enrolledStudents: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    rating: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: { 
      type: Number, 
      default: 0 
    },
  },
  { timestamps: true }
);

// Indexes for search optimization
courseSchema.index({ title: 'text', category: 'text' });
courseSchema.index({ instructor: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;
