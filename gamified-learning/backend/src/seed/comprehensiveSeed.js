import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import ModuleModel from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Batch from '../models/Batch.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Notification from '../models/Notification.js';
import Progress from '../models/Progress.js';
import Enrollment from '../models/Enrollment.js';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const seed = async () => {
    if (!MONGODB_URI) {
        console.error('Missing MONGO_URI');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Drop indexes on Course to fix the schema issue if it exists
        // This is safe because models will recreate them if needed, or we just want to clear bad ones
        try {
            await Course.collection.dropIndex('title_text_description_text_tags_1');
            console.log('Dropped old compound index on Course');
        } catch (e) {
            // Index might not exist or name is different, try dropping all if specific fails
            // or just ignore if it doesn't exist
            try {
                await Course.syncIndexes();
                console.log('Synced indexes for Course');
            } catch (err) {
                console.log('Index sync/drop warning:', err.message);
            }
        }

        // 1. Create Teachers (5)
        console.log('Creating Teachers...');
        const teachers = [];
        for (let i = 1; i <= 5; i++) {
            const email = `teacher_new_${i}@example.com`;
            let teacher = await User.findOne({ email });
            if (!teacher) {
                teacher = await User.create({
                    name: `Teacher New ${i}`,
                    email,
                    password: 'Password123!',
                    role: 'teacher',
                    specialization: 'General Education',
                    experience: Math.floor(Math.random() * 10) + 1
                });
            }
            teachers.push(teacher);
        }

        // 2. Create Students (50)
        console.log('Creating Students...');
        const students = [];
        for (let i = 1; i <= 50; i++) {
            const email = `student_new_${i}@example.com`;
            let student = await User.findOne({ email });
            if (!student) {
                student = await User.create({
                    name: `Student New ${i}`,
                    email,
                    password: 'Password123!',
                    role: 'student',
                    xp: Math.floor(Math.random() * 500),
                    level: Math.floor(Math.random() * 3) + 1
                });
            }
            students.push(student);
        }

        // 3. Create Courses (10), Modules, Lessons, Quizzes
        console.log('Creating Courses, Modules, Quizzes...');
        const courses = [];
        const quizzes = [];

        // Distribute courses among teachers (2 per teacher)
        let courseCount = 0;
        for (const teacher of teachers) {
            for (let k = 0; k < 2; k++) {
                courseCount++;
                const title = `New Course ${courseCount} - ${teacher.name}`;
                let course = await Course.findOne({ title });

                if (!course) {
                    course = await Course.create({
                        title,
                        description: `A comprehensive course about topic ${courseCount}`,
                        teacher: teacher._id,
                        category: 'General',
                        level: 'Beginner',
                        price: 0,
                        isPublished: true
                    });

                    // Create Module
                    const module = await ModuleModel.create({
                        title: `Module 1 for Course ${courseCount}`,
                        course: course._id,
                        order: 1
                    });

                    // Create Quiz for this course
                    const quiz = await Quiz.create({
                        title: `Quiz for Course ${courseCount}`,
                        instructions: 'Answer all questions',
                        course: course._id,
                        createdBy: teacher._id,
                        timeLimit: 30,
                        isActive: true, // Important for students to accept it
                        questions: [
                            {
                                questionText: 'Is this a generated question?',
                                type: 'true_false',
                                options: ['False', 'True'],
                                correctIndex: 1,
                                points: 10
                            },
                            {
                                questionText: 'Choose the correct option',
                                type: 'mcq',
                                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                                correctIndex: 0,
                                points: 10
                            }
                        ]
                    });
                    quizzes.push(quiz);

                    // Create Lesson checking the quiz
                    const lesson = await Lesson.create({
                        title: `Lesson 1: Intro`,
                        content: 'This is the lesson content.',
                        module: module._id,
                        quiz: quiz._id, // Associate quiz
                        order: 1
                    });

                    // Update relationships
                    module.lessons.push(lesson._id);
                    await module.save();
                    course.modules.push(module._id);
                    await course.save();
                }
                courses.push(course);
            }
        }

        // 4. Create Batches (10) and Enroll Students
        console.log('Creating Batches and Enrolling Students...');
        const batches = [];
        // 1 batch per course for simplicity
        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            const teacher = await User.findById(course.teacher); // ensure we have the doc
            const batchName = `Batch A - ${course.title}`;

            let batch = await Batch.findOne({ name: batchName });
            if (!batch) {
                // Distribute students: 5 students per batch (50 students / 10 batches)
                const batchStudents = students.slice(i * 5, (i + 1) * 5);
                const studentIds = batchStudents.map(s => s._id);

                batch = await Batch.create({
                    name: batchName,
                    course: course._id,
                    teacher: teacher._id,
                    students: studentIds,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                });

                // Assign quiz to this batch
                // Find the quiz for this course
                const courseQuiz = quizzes.find(q => q.course.toString() === course._id.toString());
                if (courseQuiz) {
                    courseQuiz.assignedBatches.push(batch._id);
                    await courseQuiz.save();
                }

                // Create Enrollments
                for (const student of batchStudents) {
                    await Enrollment.create({
                        student: student._id,
                        course: course._id,
                        batch: batch._id,
                        status: 'enrolled',
                        enrolledAt: new Date()
                    });
                }
            }
            batches.push(batch);
        }

        // 5. Simulate Quiz Attempts and Notifications
        console.log('Simulating Quiz Attempts...');
        for (const batch of batches) {
            // Get quiz for this batch's course
            const courseQuiz = quizzes.find(q => q.course.toString() === batch.course.toString());
            if (!courseQuiz) continue;

            // Let 4 out of 5 students attempt the quiz
            const batchStudentIds = batch.students;
            for (let j = 0; j < batchStudentIds.length - 1; j++) {
                const studentId = batchStudentIds[j];

                // Check existing attempt
                const existing = await QuizAttempt.findOne({ quiz: courseQuiz._id, student: studentId });
                if (!existing) {
                    const isPass = Math.random() > 0.2; // 80% pass rate
                    const score = isPass ? 20 : 10;
                    const correctCount = isPass ? 2 : 1;

                    const attempt = await QuizAttempt.create({
                        quiz: courseQuiz._id,
                        course: batch.course,
                        student: studentId,
                        responses: [
                            { question: courseQuiz.questions[0]._id, answer: 1, correct: true, pointsAwarded: 10 },
                            { question: courseQuiz.questions[1]._id, answer: isPass ? 0 : 1, correct: isPass, pointsAwarded: isPass ? 10 : 0 }
                        ],
                        score,
                        correctCount,
                        totalQuestions: 2,
                        completedAt: new Date()
                    });

                    // Update Progress
                    let progress = await Progress.findOne({ user: studentId, course: batch.course });
                    if (!progress) {
                        progress = await Progress.create({ user: studentId, course: batch.course });
                    }
                    progress.quizHistory.push({
                        quiz: courseQuiz._id,
                        score: (correctCount / 2) * 100,
                        takenAt: new Date()
                    });
                    await progress.save();

                    // Create Notification
                    await Notification.create({
                        user: studentId,
                        type: 'quiz_result',
                        title: 'Quiz Result Available',
                        message: `You scored ${score} on ${courseQuiz.title}`,
                        isRead: false
                    });
                }
            }
        }

        console.log('Database seeded successfully with 50 students and related data.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed();
