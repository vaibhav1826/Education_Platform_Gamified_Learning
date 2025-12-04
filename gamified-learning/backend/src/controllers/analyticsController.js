import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Announcement from '../models/Announcement.js';

export const getTeacherOverview = async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id }).select('title enrollmentCount createdAt');
  const courseIds = courses.map((course) => course._id);

  if (!courseIds.length) {
    return res.json({ courses: [], stats: [], recentAttempts: [] });
  }

  const stats = await Enrollment.aggregate([
    { $match: { course: { $in: courseIds } } },
    { $group: { _id: '$course', avgProgress: { $avg: '$progressPct' }, totalStudents: { $sum: 1 } } },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    { $project: { courseId: '$course._id', title: '$course.title', avgProgress: 1, totalStudents: 1 } }
  ]);

  const recentAttempts = await QuizAttempt.find({ course: { $in: courseIds } })
    .sort({ createdAt: -1 })
    .limit(15)
    .populate('student', 'name avatar')
    .populate('quiz', 'title');

  res.json({ courses, stats, recentAttempts });
};

export const getStudentOverview = async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate('course', 'title thumbnail category teacher');
  const courseIds = enrollments.map((enrollment) => enrollment.course?._id).filter(Boolean);

  const [progress, attempts, announcements] = await Promise.all([
    Progress.find({ user: req.user._id }).populate('course', 'title'),
    QuizAttempt.find({ student: req.user._id }).sort({ createdAt: -1 }).limit(20).populate('quiz', 'title'),
    Announcement.find({
      $or: [
        { audience: 'all' },
        { audience: 'course', course: { $in: courseIds } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'name avatar role')
  ]);

  res.json({ enrollments, progress, attempts, announcements });
};

