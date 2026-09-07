import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true
  },
  text: {
    type: String,
    required: true
  }
}, { _id: false, timestamps: { createdAt: 'timestamp', updatedAt: false } });

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    messages: [messageSchema]
  },
  { timestamps: true }
);

// Ensure one chat history per user per course
chatHistorySchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('ChatHistory', chatHistorySchema);
