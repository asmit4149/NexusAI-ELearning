import mongoose from 'mongoose';

const forumReplySchema = new mongoose.Schema(
  {
    thread: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumThread',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

// Increment repliesCount in ForumThread when a reply is added
forumReplySchema.post('save', async function (doc) {
  try {
    await mongoose.model('ForumThread').findByIdAndUpdate(
      doc.thread,
      { $inc: { repliesCount: 1 } }
    );
  } catch (error) {
    console.error('Error incrementing repliesCount:', error);
  }
});

// Decrement repliesCount in ForumThread when a reply is removed
forumReplySchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      await mongoose.model('ForumThread').findByIdAndUpdate(
        doc.thread,
        { $inc: { repliesCount: -1 } }
      );
    } catch (error) {
      console.error('Error decrementing repliesCount:', error);
    }
  }
});

export default mongoose.model('ForumReply', forumReplySchema);
