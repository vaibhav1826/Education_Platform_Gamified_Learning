import mongoose from 'mongoose';
import Course from '../models/Course.js';
import ModuleModel from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import Progress from '../models/Progress.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { io } from '../utils/socket.js';

const coursePopulateConfig = [
  { path: 'teacher', select: 'name avatar role email' },
  {
    path: 'modules',
    options: { sort: { order: 1 } },
    populate: {
      path: 'lessons',
      options: { sort: { order: 1 } },
      populate: { path: 'quiz' }
    }
  }
];

const ensureTeacherAccess = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) return null;
  if (!course.teacher.equals(userId)) {
    const error = new Error('You are not the owner of this course.');
    error.status = 403;
    throw error;
  }
  return course;
};

const withEnrollmentStatus = (courses, enrollmentMap) =>
  courses.map((course) => {
    const courseObj = course.toObject();
    courseObj.isEnrolled = enrollmentMap.has(String(course._id));
    courseObj.progressPct = enrollmentMap.get(String(course._id))?.progressPct ?? 0;
    return courseObj;
  });

export const getCourses = async (req, res) => {
  const filter = {};
  if (req.query.mine === 'true' && req.user.role === 'teacher') {
    filter.teacher = req.user._id;
  }
  if (req.query.teacherId && mongoose.Types.ObjectId.isValid(req.query.teacherId)) {
    filter.teacher = req.query.teacherId;
  }

  const courses = await Course.find(filter)
    .sort({ createdAt: -1 })
    .populate(coursePopulateConfig);

  if (req.user.role !== 'student') {
    return res.json(courses);
  }

  const enrollments = await Enrollment.find({ student: req.user._id }).select('course progressPct');
  const enrollmentMap = new Map(enrollments.map((enrollment) => [String(enrollment.course), enrollment]));
  res.json(withEnrollmentStatus(courses, enrollmentMap));
};

export const getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id).populate(coursePopulateConfig);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  let response = course;
  if (req.user.role === 'student') {
    const enrollment = await Enrollment.findOne({ course: course._id, student: req.user._id });
    response = { ...course.toObject(), isEnrolled: Boolean(enrollment), progressPct: enrollment?.progressPct ?? 0 };
  }
  res.json(response);
};

export const createCourse = async (req, res) => {
  const payload = { ...req.body, teacher: req.user._id };
  const course = await Course.create(payload);
  await course.populate(coursePopulateConfig);
  res.status(201).json(course);
};

export const updateCourse = async (req, res) => {
  await ensureTeacherAccess(req.params.id, req.user._id);
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(coursePopulateConfig);
  res.json(course);
};

export const deleteCourse = async (req, res) => {
  await ensureTeacherAccess(req.params.id, req.user._id);
  await Course.findByIdAndDelete(req.params.id);
  await Enrollment.deleteMany({ course: req.params.id });
  await Progress.deleteMany({ course: req.params.id });
  res.json({ message: 'Course deleted' });
};

export const createModule = async (req, res) => {
  await ensureTeacherAccess(req.params.id, req.user._id);
  const module = await ModuleModel.create({ ...req.body, course: req.params.id });
  await Course.findByIdAndUpdate(req.params.id, { $push: { modules: module._id } });
  res.status(201).json(module);
};

export const createLesson = async (req, res) => {
  const moduleId = req.params.moduleId || req.body.module;
  const module = await ModuleModel.findById(moduleId);
  if (!module) return res.status(404).json({ message: 'Module not found' });
  await ensureTeacherAccess(module.course, req.user._id);
  const lesson = await Lesson.create({ ...req.body, module: moduleId });
  await ModuleModel.findByIdAndUpdate(moduleId, { $push: { lessons: lesson._id } });
  res.status(201).json(lesson);
};

export const enrollInCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const existing = await Enrollment.findOne({ course: course._id, student: req.user._id });
  if (existing) return res.status(200).json(existing);

  const enrollment = await Enrollment.create({ course: course._id, student: req.user._id });
  await Course.findByIdAndUpdate(course._id, { $inc: { enrollmentCount: 1 } });
  await Progress.findOneAndUpdate(
    { user: req.user._id, course: course._id },
    { user: req.user._id, course: course._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(enrollment);
};

export const getCourseRoster = async (req, res) => {
  await ensureTeacherAccess(req.params.id, req.user._id);
  const roster = await Enrollment.find({ course: req.params.id })
    .populate('student', 'name email avatar level xp')
    .sort({ createdAt: -1 });
  res.json(roster);
};

export const getCourseAnalytics = async (req, res) => {
  await ensureTeacherAccess(req.params.id, req.user._id);
  const courseId = new mongoose.Types.ObjectId(req.params.id);

  const [enrollmentStats, quizStats, recentAttempts] = await Promise.all([
    Enrollment.aggregate([
      { $match: { course: courseId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progressPct' },
          avgQuiz: { $avg: '$quizAverage' }
        }
      }
    ]),
    QuizAttempt.aggregate([
      { $match: { course: courseId } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          avgCorrect: { $avg: '$correctCount' },
          attempts: { $sum: 1 }
        }
      }
    ]),
    QuizAttempt.find({ course: courseId }).sort({ createdAt: -1 }).limit(10).populate('student', 'name avatar')
  ]);

  res.json({
    enrollments: enrollmentStats,
    quiz: quizStats[0] || { avgScore: 0, avgCorrect: 0, attempts: 0 },
    recentAttempts
  });
};

export const getCourseAnnouncements = async (req, res) => {
  const filter = [
    { audience: 'all' },
    { audience: 'course', course: req.params.id }
  ];
  const announcements = await Announcement.find({ $or: filter })
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit || '20', 10))
    .populate('author', 'name avatar role');
  res.json(announcements);
};

export const postAnnouncement = async (req, res) => {
  const course = await ensureTeacherAccess(req.params.id, req.user._id);
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required.' });
  }
  const announcement = await Announcement.create({
    course: course._id,
    audience: 'course',
    title,
    body,
    author: req.user._id
  });
  await announcement.populate('author', 'name avatar role');

  const enrollments = await Enrollment.find({ course: course._id }).select('student');
  const notificationsPayload = enrollments.map((enrollment) => ({
    user: enrollment.student,
    type: 'announcement',
    title,
    message: body,
    meta: { courseId: course._id, announcementId: announcement._id }
  }));
  if (notificationsPayload.length) {
    await Notification.insertMany(notificationsPayload);
    const socketServer = io();
    notificationsPayload.forEach((notification) => {
      socketServer?.to(`user:${notification.user}`).emit('announcement:new', notification);
    });
    socketServer?.to(`course:${course._id}`).emit('announcement:new', announcement);
  }

  res.status(201).json(announcement);
};
