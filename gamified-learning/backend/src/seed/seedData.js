import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import ModuleModel from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Course.deleteMany(),
    ModuleModel.deleteMany(),
    Lesson.deleteMany(),
    Quiz.deleteMany(),
    Question.deleteMany()
  ]);

  const quiz = await Quiz.create({ title: 'Intro Quiz', timeLimit: 120 });
  const question = await Question.create({
    prompt: '2 + 2 = ?',
    options: ['3', '4', '5', '6'],
    answer: '4',
    quiz: quiz._id
  });
  quiz.questions.push(question._id);
  await quiz.save();

  const lesson = await Lesson.create({ title: 'Lesson 1', content: 'Fundamentals', quiz: quiz._id });
  const module = await ModuleModel.create({ title: 'Module 1', lessons: [lesson._id] });
  const course = await Course.create({ title: 'Gamification 101', description: 'Learn the basics', modules: [module._id] });

  lesson.module = module._id;
  await lesson.save();
  module.course = course._id;
  await module.save();

  await User.create({ name: 'Admin User', email: 'admin@example.com', password: 'Password123!', role: 'admin' });
  await User.create({ name: 'Student User', email: 'student@example.com', password: 'Password123!', role: 'student' });

  console.log('Seed complete');
  mongoose.connection.close();
};

seed();