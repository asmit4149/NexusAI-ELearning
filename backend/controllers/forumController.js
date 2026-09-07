import ForumThread from '../models/ForumThread.js';

export const createThread = async (req, res, next) => {
  try {
    const thread = await ForumThread.create({
      course: req.params.courseId,
      user: req.user._id,
      title: req.body.title,
      content: req.body.content
    });
    res.status(201).json({ success: true, data: thread });
  } catch (error) { 
    next(error); 
  }
};

export const getThreads = async (req, res, next) => {
  try {
    const threads = await ForumThread.find({ course: req.params.courseId })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: threads });
  } catch (error) { 
    next(error); 
  }
};
