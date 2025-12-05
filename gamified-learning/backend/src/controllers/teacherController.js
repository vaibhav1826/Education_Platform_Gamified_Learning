import Batch from '../models/Batch.js';
import Quiz from '../models/Quiz.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';

export const getDashboard = async (req, res) => {
  const teacherId = req.user._id;

  const [batches, quizzes, submissions] = await Promise.all([
    Batch.find({ teacher: teacherId }),
    Quiz.find({ createdBy: teacherId }),
    Submission.find({ batch: { $in: await Batch.find({ teacher: teacherId }).distinct('_id') } })
      .populate('student', 'name email profileImage')
      .populate('quiz', 'title')
      .populate('batch', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
  ]);

  const allBatchIds = batches.map((b) => b._id);
  const allStudentIds = [...new Set(batches.flatMap((b) => b.students.map((s) => s.toString())))];
  const avgScore =
    submissions.length > 0
      ? submissions.reduce((sum, s) => sum + (s.score / s.totalQuestions) * 100, 0) / submissions.length
      : 0;

  const upcomingQuizzes = quizzes.filter((q) => q.scheduledAt && q.scheduledAt > new Date()).slice(0, 5);

  res.json({
    stats: {
      totalBatches: batches.length,
      totalStudents: allStudentIds.length,
      totalQuizzes: quizzes.length,
      averagePerformance: Math.round(avgScore)
    },
    recentActivities: submissions.map((s) => ({
      type: 'quiz_submission',
      student: s.student.name,
      quiz: s.quiz.title,
      batch: s.batch.name,
      score: s.score,
      createdAt: s.createdAt
    })),
    upcomingTests: upcomingQuizzes.map((q) => ({
      id: q._id,
      title: q.title,
      scheduledAt: q.scheduledAt,
      batches: q.assignedBatches.length
    }))
  });
};

export const createBatch = async (req, res) => {
  const { name, description, subject } = req.body;
  const batch = await Batch.create({
    teacher: req.user._id,
    name: name?.trim(),
    description: description?.trim() || undefined,
    subject: subject?.trim() || undefined,
    students: []
  });
  res.status(201).json(batch);
};

export const getBatches = async (req, res) => {
  const batches = await Batch.find({ teacher: req.user._id })
    .populate('students', 'name email profileImage')
    .sort({ createdAt: -1 });
  res.json(batches);
};

export const getBatch = async (req, res) => {
  const batch = await Batch.findOne({ _id: req.params.id, teacher: req.user._id })
    .populate('students', 'name email profileImage role')
    .populate('teacher', 'name email profileImage');
  if (!batch) return res.status(404).json({ message: 'Batch not found' });
  res.json(batch);
};

export const updateBatch = async (req, res) => {
  const { name, description, subject } = req.body;
  const batch = await Batch.findOneAndUpdate(
    { _id: req.params.id, teacher: req.user._id },
    {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() || undefined }),
      ...(subject !== undefined && { subject: subject.trim() || undefined })
    },
    { new: true }
  );
  if (!batch) return res.status(404).json({ message: 'Batch not found' });
  res.json(batch);
};

export const deleteBatch = async (req, res) => {
  const batch = await Batch.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
  if (!batch) return res.status(404).json({ message: 'Batch not found' });
  res.json({ message: 'Batch deleted' });
};

export const searchStudents = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json([]);
  }
  const query = q.trim();
  const students = await User.find({
    role: 'student',
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  })
    .select('name email profileImage role')
    .limit(20);
  res.json(students);
};

export const addStudentToBatch = async (req, res) => {
  const { studentId } = req.body;
  const batch = await Batch.findOne({ _id: req.params.batchId, teacher: req.user._id });
  if (!batch) return res.status(404).json({ message: 'Batch not found' });

  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return res.status(400).json({ message: 'Invalid student' });
  }

  if (!batch.students.includes(studentId)) {
    batch.students.push(studentId);
    await batch.save();
  }

  const updated = await Batch.findById(batch._id).populate('students', 'name email profileImage');
  res.json(updated);
};

export const removeStudentFromBatch = async (req, res) => {
  const batch = await Batch.findOne({ _id: req.params.batchId, teacher: req.user._id });
  if (!batch) return res.status(404).json({ message: 'Batch not found' });

  batch.students = batch.students.filter((id) => id.toString() !== req.params.studentId);
  await batch.save();

  const updated = await Batch.findById(batch._id).populate('students', 'name email profileImage');
  res.json(updated);
};

export const getBatchLeaderboard = async (req, res) => {
  const batch = await Batch.findOne({ _id: req.params.id, teacher: req.user._id });
  if (!batch) return res.status(404).json({ message: 'Batch not found' });

  const quizzes = await Quiz.find({ assignedBatches: batch._id });
  const quizIds = quizzes.map((q) => q._id);

  const submissions = await Submission.aggregate([
    { $match: { batch: batch._id, quiz: { $in: quizIds } } },
    {
      $group: {
        _id: '$student',
        totalScore: { $sum: '$score' },
        totalQuestions: { $sum: '$totalQuestions' },
        quizCount: { $sum: 1 },
        avgScore: { $avg: { $divide: ['$score', '$totalQuestions'] } }
      }
    },
    { $sort: { totalScore: -1 } }
  ]);

  const studentIds = submissions.map((s) => s._id);
  const students = await User.find({ _id: { $in: studentIds } }).select('name email profileImage xp level');

  const leaderboard = submissions.map((sub) => {
    const student = students.find((s) => s._id.toString() === sub._id.toString());
    return {
      student: student || { name: 'Unknown', email: '', profileImage: '' },
      totalScore: sub.totalScore,
      averagePercent: Math.round((sub.avgScore || 0) * 100),
      quizAttempts: sub.quizCount
    };
  });

  res.json(leaderboard);
};

export const getGlobalLeaderboard = async (req, res) => {
  const batches = await Batch.find({ teacher: req.user._id });
  const batchIds = batches.map((b) => b._id);
  const quizzes = await Quiz.find({ createdBy: req.user._id });
  const quizIds = quizzes.map((q) => q._id);

  const submissions = await Submission.aggregate([
    { $match: { batch: { $in: batchIds }, quiz: { $in: quizIds } } },
    {
      $group: {
        _id: '$student',
        totalScore: { $sum: '$score' },
        quizCount: { $sum: 1 }
      }
    },
    { $sort: { totalScore: -1 } }
  ]);

  const studentIds = submissions.map((s) => s._id);
  const students = await User.find({ _id: { $in: studentIds } }).select('name email profileImage xp level role');

  const allBatchNames = {};
  for (const batch of batches) {
    batch.students.forEach((sid) => {
      if (!allBatchNames[sid.toString()]) allBatchNames[sid.toString()] = [];
      allBatchNames[sid.toString()].push(batch.name);
    });
  }

  const leaderboard = submissions.map((sub, index) => {
    const student = students.find((s) => s._id.toString() === sub._id.toString());
    return {
      rank: index + 1,
      student: student || { name: 'Unknown', email: '', profileImage: '', xp: 0, level: 1 },
      batches: allBatchNames[sub._id.toString()] || [],
      totalScore: sub.totalScore,
      quizAttempts: sub.quizCount
    };
  });

  res.json(leaderboard);
};

