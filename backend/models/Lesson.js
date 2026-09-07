import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Please add a lesson title'] 
    },
    description: { 
      type: String,
      required: [true, 'Please add a description'] 
    },
    videoUrl: { 
      type: String 
    },
    notesUrl: { 
      type: String 
    },
    duration: { 
      type: Number,
      default: 0
    },
    course: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Course',
      required: true
    },
    order: { 
      type: Number,
      required: true
    },
  },
  { timestamps: true }
);

lessonSchema.index({ course: 1, order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
