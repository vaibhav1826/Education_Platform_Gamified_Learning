import Lesson from '../models/Lesson.js';
import ModuleModel from '../models/Module.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import Enrollment from '../models/Enrollment.js';

export const getLesson = async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate('quiz');
  res.json(lesson);
};

export const completeLesson = async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
  const module = await ModuleModel.findById(lesson.module);
  if (!module) return res.status(404).json({ message: 'Module not found' });
  const course = await Course.findById(module.course).populate({
    path: 'modules',
    populate: { path: 'lessons' }
  });
  if (!course) return res.status(404).json({ message: 'Course not found' });

  let progress = await Progress.findOne({ user: req.user._id, course: course._id });
  if (!progress) {
    progress = await Progress.create({ user: req.user._id, course: course._id });
  }

  const existingLesson = progress.lessons.find((entry) => String(entry.lesson) === String(lesson._id));
  if (existingLesson) {
    existingLesson.completed = true;
  } else {
    progress.lessons.push({ lesson: lesson._id, completed: true });
  }

  const totalLessons = course.modules.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0) || 1;
  const completedLessons = progress.lessons.filter((entry) => entry.completed).length;
  progress.completionPct = Math.min(100, Math.round((completedLessons / totalLessons) * 100));
  await progress.save();

  await Enrollment.findOneAndUpdate(
    { course: course._id, student: req.user._id },
    { progressPct: progress.completionPct, lastActivityAt: new Date() }
  );

  res.json({ completionPct: progress.completionPct, completedLessons, totalLessons });
};