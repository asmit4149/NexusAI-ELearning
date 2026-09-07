import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adaptiveRoutes from './routes/adaptiveRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import { seedWeeklyChallenges } from './services/gamificationService.js';

dotenv.config();

// Connect to MongoDB
await connectDB();
seedWeeklyChallenges();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'https://your-production-url.com' : 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_course', (courseId) => {
    socket.join(courseId);
    console.log(`User ${socket.id} joined course room: ${courseId}`);
  });

  socket.on('send_message', (data) => {
    // Broadcast to everyone in the room (including sender to confirm, or use socket.to().emit to exclude sender)
    io.to(data.courseId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- Security & Utility Middleware ---
app.use(helmet());

// CORS configuration (allow frontend URL)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-production-url.com' : 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging for development
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/adaptive', adaptiveRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.get('/', (req, res) => {
  res.send('NexusAI API is running...');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy and secure' });
});

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
