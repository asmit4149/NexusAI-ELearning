import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('Clearing old data...');
    await User.deleteMany();
    await Course.deleteMany();

    console.log('Creating Admin/Instructor User...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const admin = await User.create({
      name: 'Admin Instructor',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'Admin',
      points: 1500,
    });

    console.log('Creating Student Users for Leaderboard...');
    await User.create([
      { name: 'Alice Smith', email: 'alice@example.com', password: hashedPassword, role: 'Student', points: 1200 },
      { name: 'Bob Jones', email: 'bob@example.com', password: hashedPassword, role: 'Student', points: 950 },
      { name: 'Charlie Brown', email: 'charlie@example.com', password: hashedPassword, role: 'Student', points: 800 }
    ]);

    console.log('Creating Mock Courses...');
    await Course.create([
      {
        title: 'Introduction to Artificial Intelligence',
        description: 'Learn the basics of AI, machine learning, and neural networks.',
        category: 'Technology',
        level: 'Beginner',
        price: 0,
        accessType: 'free',
        instructor: admin._id,
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
        rating: 4.8
      },
      {
        title: 'Advanced React Development',
        description: 'Master React, hooks, state management, and performance optimization.',
        category: 'Web Development',
        level: 'Advanced',
        price: 49.99,
        accessType: 'premium',
        instructor: admin._id,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
        rating: 4.9
      },
      {
        title: 'Data Science with Python',
        description: 'A comprehensive guide to pandas, numpy, and data visualization.',
        category: 'Data Science',
        level: 'Intermediate',
        price: 29.99,
        accessType: 'premium',
        instructor: admin._id,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        rating: 4.7
      }
    ]);

    console.log('✅ Data successfully seeded!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
