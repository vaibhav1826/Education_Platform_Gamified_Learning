import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Batch from '../models/Batch.js';
import Quiz from '../models/Quiz.js';
import Submission from '../models/Submission.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-learning';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create a teacher
    let teacher = await User.findOne({ email: 'teacher@example.com' });
    if (!teacher) {
      teacher = await User.create({
        name: 'John Teacher',
        email: 'teacher@example.com',
        password: 'Teacher123!',
        role: 'teacher',
        specialization: 'Mathematics',
        experience: 5
      });
      console.log('Created teacher:', teacher.email);
    }

    // Create students
    const studentEmails = ['student1@example.com', 'student2@example.com', 'student3@example.com'];
    const students = [];
    for (const email of studentEmails) {
      let student = await User.findOne({ email });
      if (!student) {
        student = await User.create({
          name: email.split('@')[0].replace('student', 'Student '),
          email,
          password: 'Student123!',
          role: 'student',
          xp: Math.floor(Math.random() * 1000),
          level: Math.floor(Math.random() * 5) + 1
        });
        console.log('Created student:', student.email);
      }
      students.push(student);
    }

    // Create batches
    const batches = [];
    const batchNames = ['Mathematics Batch A', 'Mathematics Batch B', 'Advanced Calculus'];
    for (let i = 0; i < 3; i++) {
      let batch = await Batch.findOne({ name: batchNames[i], teacher: teacher._id });
      if (!batch) {
        batch = await Batch.create({
          teacher: teacher._id,
          name: batchNames[i],
          description: `Batch for ${batchNames[i]}`,
          subject: 'Mathematics',
          students: [students[i % students.length]._id]
        });
        console.log('Created batch:', batch.name);
      }
      batches.push(batch);
    }

    // Create quizzes
    const quizzes = [];
    const quizTitles = ['Basic Algebra Quiz', 'Geometry Fundamentals', 'Calculus Basics'];
    for (let i = 0; i < 3; i++) {
      let quiz = await Quiz.findOne({ title: quizTitles[i], createdBy: teacher._id });
      if (!quiz) {
        quiz = await Quiz.create({
          title: quizTitles[i],
          instructions: `Complete this quiz on ${quizTitles[i]}`,
          questions: [
            {
              questionText: `What is 2 + 2?`,
              options: ['3', '4', '5', '6'],
              correctIndex: 1,
              points: 1
            },
            {
              questionText: `What is the square root of 16?`,
              options: ['2', '3', '4', '5'],
              correctIndex: 2,
              points: 1
            },
            {
              questionText: `What is 5 × 3?`,
              options: ['12', '15', '18', '20'],
              correctIndex: 1,
              points: 1
            }
          ],
          assignedBatches: [batches[i % batches.length]._id],
          createdBy: teacher._id,
          isActive: true
        });
        console.log('Created quiz:', quiz.title);
      }
      quizzes.push(quiz);
    }

    // Create submissions
    for (let i = 0; i < 5; i++) {
      const student = students[i % students.length];
      const quiz = quizzes[i % quizzes.length];
      const batch = batches[i % batches.length];

      const existing = await Submission.findOne({
        student: student._id,
        quiz: quiz._id
      });

      if (!existing) {
        const answers = quiz.questions.map((q, qIdx) => ({
          questionIndex: qIdx,
          selectedIndex: q.correctIndex, // All correct for seed data
          isCorrect: true
        }));

        const score = quiz.questions.length;
        const submission = await Submission.create({
          student: student._id,
          quiz: quiz._id,
          batch: batch._id,
          score,
          totalQuestions: quiz.questions.length,
          correctAnswers: score,
          answers,
          submittedAt: new Date(Date.now() - i * 3600000) // Staggered times
        });
        console.log(`Created submission for ${student.name} on ${quiz.title}`);
      }
    }

    console.log('\n✅ Seed data created successfully!');
    console.log(`Teacher: ${teacher.email}`);
    console.log(`Students: ${students.length}`);
    console.log(`Batches: ${batches.length}`);
    console.log(`Quizzes: ${quizzes.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();

