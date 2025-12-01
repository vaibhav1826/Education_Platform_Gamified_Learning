import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import { applyGamificationEvent } from '../utils/gamification.js';

export const getQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('questions');
  res.json(quiz);
};

export const createQuiz = async (req, res) => {
  const quiz = await Quiz.create(req.body);
  res.status(201).json(quiz);
};

export const addQuestion = async (req, res) => {
  const question = await Question.create({ ...req.body, quiz: req.params.id });
  await Quiz.findByIdAndUpdate(req.params.id, { $push: { questions: question._id } });
  res.status(201).json(question);
};

export const submitQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('questions');
  const { answers } = req.body;
  let { courseId } = req.body;

  if (!courseId && quiz.lesson) {
    const lessonDoc = await Lesson.findById(quiz.lesson).populate('module');
    courseId = lessonDoc?.module?.course;
  }

  if (!courseId) {
    return res.status(400).json({ message: 'Course reference required' });
  }
  let correct = 0;

  quiz.questions.forEach((question) => {
    const attempt = answers.find((ans) => ans.questionId === String(question._id));
    if (attempt && attempt.answer === question.answer) correct += 1;
  });

  let progress = await Progress.findOne({ user: req.user._id, course: courseId });
  if (!progress) progress = await Progress.create({ user: req.user._id, course: courseId });
  progress.score += correct * 10;
  await progress.save();

  const result = { correct, total: quiz.questions.length, score: correct * 10 };
  await applyGamificationEvent(req.user, 'quiz_complete', result);

  res.json(result);
};