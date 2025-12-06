import Quiz from '../models/Quiz.js';
import Batch from '../models/Batch.js';
import Submission from '../models/Submission.js';

export const createQuiz = async (req, res) => {
  const { title, instructions, questions, assignedBatches, scheduledAt, timeLimit } = req.body;

  const quiz = await Quiz.create({
    title: title?.trim(),
    instructions: instructions?.trim() || undefined,
    questions: questions || [],
    assignedBatches: assignedBatches || [],
    createdBy: req.user._id,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    timeLimit: timeLimit ? Number(timeLimit) : undefined,
    isActive: true
  });

  res.status(201).json(quiz);
};

export const getQuizzes = async (req, res) => {
  const quizzes = await Quiz.find({ createdBy: req.user._id })
    .populate('assignedBatches', 'name')
    .sort({ createdAt: -1 });
  res.json(quizzes);
};

export const getQuiz = async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, createdBy: req.user._id })
    .populate('assignedBatches', 'name students')
    .populate('createdBy', 'name email profileImage');
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  res.json(quiz);
};

export const updateQuiz = async (req, res) => {
  const { title, instructions, questions, assignedBatches, scheduledAt, timeLimit, isActive } = req.body;
  const quiz = await Quiz.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    {
      ...(title && { title: title.trim() }),
      ...(instructions !== undefined && { instructions: instructions.trim() || undefined }),
      ...(questions && { questions }),
      ...(assignedBatches !== undefined && { assignedBatches }),
      ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined }),
      ...(timeLimit !== undefined && { timeLimit: timeLimit ? Number(timeLimit) : undefined }),
      ...(isActive !== undefined && { isActive })
    },
    { new: true }
  );
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  res.json(quiz);
};

export const deleteQuiz = async (req, res) => {
  const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  res.json({ message: 'Quiz deleted' });
};

export const getQuizSubmissions = async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, createdBy: req.user._id });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  const submissions = await Submission.find({ quiz: quiz._id })
    .populate('student', 'name email profileImage')
    .populate('batch', 'name')
    .sort({ submittedAt: -1 });

  res.json(submissions);
};

export const getSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('student', 'name email profileImage')
    .populate('quiz', 'title questions')
    .populate('batch', 'name');

  if (!submission) return res.status(404).json({ message: 'Submission not found' });

  const quiz = await Quiz.findById(submission.quiz._id);
  if (quiz.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  res.json(submission);
};
