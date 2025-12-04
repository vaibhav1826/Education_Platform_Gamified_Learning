import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Notification from '../models/Notification.js';
import { applyGamificationEvent } from '../utils/gamification.js';
import { io } from '../utils/socket.js';

const questionValidators = {
  mcq: (question) => {
    if (!question.options || question.options.length < 2) throw new Error('MCQ requires at least two options.');
  },
  true_false: () => {},
  short_answer: () => {}
};

const deriveCourseId = async (quiz) => {
  if (quiz.course) return quiz.course;
  if (!quiz.lesson) return null;
  const lessonDoc = await Lesson.findById(quiz.lesson).populate('module');
  return lessonDoc?.module?.course || null;
};

const isAnswerCorrect = (question, submittedAnswer) => {
  switch (question.type) {
    case 'true_false':
      return String(question.answer) === String(submittedAnswer);
    case 'short_answer':
      return (
        typeof submittedAnswer === 'string' &&
        typeof question.answer === 'string' &&
        submittedAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()
      );
    default:
      return question.answer === submittedAnswer;
  }
};

const ensureTeacherOwnsQuiz = async (quizId, teacherId) => {
  const quiz = await Quiz.findById(quizId).populate('course');
  if (!quiz) return null;
  const course = quiz.course || (await Course.findById(await deriveCourseId(quiz)));
  if (!course) return null;
  if (!course.teacher.equals(teacherId)) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
  return { quiz, course };
};

export const getQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('questions').populate('course', 'title teacher');
  res.json(quiz);
};

export const createQuiz = async (req, res) => {
  const payload = { ...req.body };
  if (!payload.course && payload.lesson) {
    const lessonDoc = await Lesson.findById(payload.lesson).populate('module');
    payload.course = lessonDoc?.module?.course;
  }
  const quiz = await Quiz.create(payload);
  res.status(201).json(quiz);
};

export const addQuestion = async (req, res) => {
  const { type = 'mcq' } = req.body;
  if (questionValidators[type]) questionValidators[type](req.body);
  const question = await Question.create({ ...req.body, quiz: req.params.id, type });
  await Quiz.findByIdAndUpdate(
    req.params.id,
    { $push: { questions: question._id }, $inc: { totalPoints: question.points || 1 } },
    { new: true }
  );
  res.status(201).json(question);
};

export const assignQuiz = async (req, res) => {
  const { lessonId } = req.body;
  const lesson = await Lesson.findById(lessonId).populate('module');
  if (!lesson || !lesson.module) return res.status(404).json({ message: 'Lesson not found' });
  const course = await Course.findById(lesson.module.course);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (!course.teacher.equals(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const quiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    { lesson: lessonId, course: course._id, status: 'published' },
    { new: true }
  ).populate('questions');
  await Lesson.findByIdAndUpdate(lessonId, { quiz: quiz._id });
  res.json(quiz);
};

export const getQuizAttempts = async (req, res) => {
  const ownership = await ensureTeacherOwnsQuiz(req.params.id, req.user._id);
  if (!ownership?.quiz) return res.status(404).json({ message: 'Quiz not found' });
  const { quiz } = ownership;
  const attempts = await QuizAttempt.find({ quiz: quiz._id })
    .sort({ createdAt: -1 })
    .populate('student', 'name email avatar');
  res.json(attempts);
};

export const submitQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('questions');
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  const answers = req.body.answers || [];
  let { courseId } = req.body;

  if (!courseId) {
    courseId = await deriveCourseId(quiz);
  }
  if (!courseId) return res.status(400).json({ message: 'Course reference required' });

  const responses = quiz.questions.map((question) => {
    const attempt = answers.find((ans) => ans.questionId === String(question._id));
    const submittedAnswer = attempt?.answer;
    const correct = isAnswerCorrect(question, submittedAnswer);
    return {
      question: question._id,
      answer: submittedAnswer,
      correct,
      pointsAwarded: correct ? question.points || 1 : 0
    };
  });

  const score = responses.reduce((sum, response) => sum + response.pointsAwarded, 0);
  const correctCount = responses.filter((response) => response.correct).length;
  const totalPoints = quiz.totalPoints || quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const durationSeconds = req.body.durationSeconds || 0;

  const attemptDoc = await QuizAttempt.create({
    quiz: quiz._id,
    course: courseId,
    student: req.user._id,
    responses,
    score,
    correctCount,
    totalQuestions: quiz.questions.length,
    durationSeconds
  });

  let progress = await Progress.findOne({ user: req.user._id, course: courseId });
  if (!progress) {
    progress = await Progress.create({ user: req.user._id, course: courseId });
  }
  progress.score += score;
  progress.quizHistory.push({ quiz: quiz._id, score });
  await progress.save();

  await applyGamificationEvent(req.user, 'quiz_complete', { correct: correctCount, total: quiz.questions.length });

  const enrollment = await Enrollment.findOne({ course: courseId, student: req.user._id });
  if (enrollment) {
    const stats = await QuizAttempt.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId), student: req.user._id } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);
    await Enrollment.updateOne(
      { _id: enrollment._id },
      {
        quizAverage: stats[0]?.avgScore ?? score,
        lastActivityAt: new Date()
      }
    );
  }

  const course = await Course.findById(courseId).populate('teacher', 'name');
  if (course?.teacher?._id) {
    await Notification.create({
      user: course.teacher._id,
      type: 'quiz_result',
      title: `${req.user.name} submitted ${quiz.title}`,
      message: `Score ${score}/${totalPoints}`,
      meta: { quizId: quiz._id, courseId }
    });
    const socketServer = io();
    socketServer?.to(`user:${req.user._id}`).emit('quiz:result', { quizId: quiz._id, score, totalPoints });
    socketServer?.to(`user:${course.teacher._id}`).emit('quiz:result', {
      quizId: quiz._id,
      student: { id: req.user._id, name: req.user.name },
      score,
      totalPoints
    });
  }

  res.json({
    attemptId: attemptDoc._id,
    score,
    totalPoints,
    correct: correctCount,
    total: quiz.questions.length,
    passed: score >= quiz.passingScore
  });
};
