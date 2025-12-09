import User from '../models/User.js';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Submission from '../models/Submission.js';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';
import { emitToUser, emitToRole, emitToAll, emitToBatch } from '../utils/socket.js';

// -------- Users ----------
export const listTeachers = async (_req, res) => {
  const teachers = await User.find({ role: 'teacher' }).select('-password -refreshToken');
  res.json(teachers);
};

export const listStudents = async (_req, res) => {
  const students = await User.find({ role: 'student' }).select('-password -refreshToken');
  res.json(students);
};

export const updateUserStatus = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { status: req.body.status }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  emitToUser(user._id.toString(), 'user:status_changed', { status: user.status });
  emitToRole('admin', 'user:updated', user.safeObject());
  res.json(user.safeObject());
};

export const updateUserRole = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { role: req.body.role }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  emitToUser(user._id.toString(), 'user:role_changed', { role: user.role });
  emitToRole('admin', 'user:updated', user.safeObject());
  res.json(user.safeObject());
};

export const updateUserProfile = async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(req.params.userId, { ...(name && { name }), ...(email && { email }) }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.safeObject());
};

// -------- Batches & Courses ----------
export const listBatches = async (_req, res) => {
  const batches = await Batch.find().populate('teacher', 'name email').populate('students', 'name email');
  res.json(batches);
};

export const deleteBatch = async (req, res) => {
  const batch = await Batch.findByIdAndDelete(req.params.batchId);
  if (!batch) return res.status(404).json({ message: 'Batch not found' });
  const notifyUsers = [...batch.students.map((s) => s.toString()), batch.teacher?.toString()].filter(Boolean);
  if (notifyUsers.length) {
    const payload = notifyUsers.map((u) => ({
      user: u,
      type: 'system',
      title: 'Batch removed',
      message: `Batch "${batch.name}" has been removed by admin.`
    }));
    await Notification.insertMany(payload);
  }
  res.json({ message: 'Batch removed' });
};

export const listCourses = async (_req, res) => {
  const courses = await Course.find().populate('teacher', 'name email');
  res.json(courses);
};

export const updateCourseStatus = async (req, res) => {
  const { status, reason } = req.body;
  const course = await Course.findByIdAndUpdate(
    req.params.courseId,
    { approvalStatus: status, rejectionReason: reason },
    { new: true }
  ).populate('teacher', 'name email');
  if (!course) return res.status(404).json({ message: 'Course not found' });
  // notify teacher
  await Notification.create({
    user: course.teacher._id,
    type: 'system',
    title: `Course ${status}`,
    message: `Your course "${course.title}" is ${status}.`
  });
  emitToUser(course.teacher._id.toString(), 'course:status_changed', course);
  emitToUser(course.teacher._id.toString(), 'notification:new', { type: 'course_status' });
  emitToRole('admin', 'course:updated', course);
  emitToRole('teacher', 'course:updated', course);
  res.json(course);
};

// -------- Quizzes & Submissions ----------
export const listQuizzes = async (_req, res) => {
  const quizzes = await Quiz.find().populate('createdBy', 'name email');
  res.json(quizzes);
};

export const updateQuizStatus = async (req, res) => {
  const { status, reason } = req.body;
  const quiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    { approvalStatus: status, rejectionReason: reason },
    { new: true }
  ).populate('createdBy', 'name email');
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  await Notification.create({
    user: quiz.createdBy._id,
    type: 'system',
    title: `Quiz ${status}`,
    message: `Your quiz "${quiz.title}" is ${status}.`
  });
  emitToUser(quiz.createdBy._id.toString(), 'quiz:status_changed', quiz);
  emitToUser(quiz.createdBy._id.toString(), 'notification:new', { type: 'quiz_status' });
  emitToRole('admin', 'quiz:updated', quiz);
  emitToRole('teacher', 'quiz:updated', quiz);
  res.json(quiz);
};

export const deleteQuiz = async (req, res) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  await Notification.create({
    user: quiz.createdBy,
    type: 'system',
    title: 'Quiz removed',
    message: `Your quiz "${quiz.title}" was removed by admin.`
  });
  res.json({ message: 'Quiz removed' });
};

export const listSubmissions = async (_req, res) => {
  const submissions = await Submission.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .populate('student', 'name email')
    .populate('quiz', 'title')
    .populate('batch', 'name');
  res.json(submissions);
};

// -------- Student monitoring ----------
export const getStudentStats = async (req, res) => {
  const student = await User.findById(req.params.id).select('name xp level streak badges');
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
};

export const getStudentSubmissions = async (req, res) => {
  const submissions = await Submission.find({ student: req.params.id })
    .sort({ createdAt: -1 })
    .populate('quiz', 'title')
    .populate('batch', 'name');
  res.json(submissions);
};

export const getStudentBatches = async (req, res) => {
  const batches = await Batch.find({ students: req.params.id }).populate('teacher', 'name');
  res.json(batches);
};

// -------- Announcements & notifications ----------
export const createAdminAnnouncement = async (req, res) => {
  const { title, message, target } = req.body;
  const announcement = await Announcement.create({
    title,
    body: message,
    author: req.user._id,
    audience: 'all',
    target: target || 'all'
  });
  res.status(201).json(announcement);
};

export const getAdminAnnouncementsForRole = async (req, res) => {
  const role = req.params.role;
  const filter = [{ target: 'all' }];
  if (role === 'student') filter.push({ target: 'students' });
  if (role === 'teacher') filter.push({ target: 'teachers' });
  const announcements = await Announcement.find({ $or: filter }).sort({ createdAt: -1 }).limit(20);
  res.json(announcements);
};

export const createAdminNotifications = async (req, res) => {
  const { title, message, targetRole, userIds } = req.body;
  let users = [];
  if (Array.isArray(userIds) && userIds.length) {
    users = userIds;
  } else if (targetRole) {
    users = await User.find({ role: targetRole }).distinct('_id');
  }
  const payload = users.map((u) => ({ user: u, type: 'system', title, message }));
  if (payload.length) await Notification.insertMany(payload);
  res.status(201).json({ created: payload.length });
};

// -------- Leaderboards ----------
export const getAdminStudentLeaderboard = async (_req, res) => {
  const submissions = await Submission.aggregate([
    {
      $group: {
        _id: '$student',
        totalScore: { $sum: '$score' },
        attempts: { $sum: 1 }
      }
    },
    { $sort: { totalScore: -1 } },
    { $limit: 100 }
  ]);
  const users = await User.find({ _id: { $in: submissions.map((s) => s._id) } }).select('name xp level');
  const leaderboard = submissions.map((s, idx) => ({
    rank: idx + 1,
    student: users.find((u) => u._id.toString() === s._id.toString()),
    totalScore: s.totalScore,
    attempts: s.attempts
  }));
  res.json(leaderboard);
};

export const getAdminTeacherLeaderboard = async (_req, res) => {
  const batchAgg = await Batch.aggregate([
    { $group: { _id: '$teacher', batches: { $sum: 1 } } }
  ]);
  const quizAgg = await Quiz.aggregate([
    { $group: { _id: '$createdBy', quizzes: { $sum: 1 } } }
  ]);
  const submissionAgg = await Submission.aggregate([
    {
      $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quizDoc' }
    },
    { $unwind: '$quizDoc' },
    { $group: { _id: '$quizDoc.createdBy', score: { $sum: '$score' }, attempts: { $sum: 1 } } }
  ]);
  const teacherIds = new Set([...batchAgg, ...quizAgg, ...submissionAgg].map((i) => i._id?.toString()).filter(Boolean));
  const teachers = await User.find({ _id: { $in: [...teacherIds] } }).select('name email');
  const leaderboard = [...teacherIds].map((id) => {
    const batches = batchAgg.find((b) => b._id?.toString() === id)?.batches || 0;
    const quizzes = quizAgg.find((q) => q._id?.toString() === id)?.quizzes || 0;
    const performance = submissionAgg.find((s) => s._id?.toString() === id)?.score || 0;
    return {
      teacher: teachers.find((t) => t._id.toString() === id),
      batches,
      quizzes,
      performance,
      activityScore: batches * 2 + quizzes + performance / 100
    };
  }).sort((a, b) => b.activityScore - a.activityScore);
  res.json(leaderboard);
};

// -------- Settings ----------
export const getSettings = async (_req, res) => {
  const settings = await Settings.getSingleton();
  res.json(settings);
};

export const updateSettings = async (req, res) => {
  const settings = await Settings.getSingleton();
  Object.assign(settings, req.body);
  await settings.save();
  res.json(settings);
};

