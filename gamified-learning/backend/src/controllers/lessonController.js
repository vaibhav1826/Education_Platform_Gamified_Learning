import Lesson from '../models/Lesson.js';
import ModuleModel from '../models/Module.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import Enrollment from '../models/Enrollment.js';

export const getLesson = async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate('quiz').populate('assignment');
  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
  res.json(lesson);
};

// Helper: Ensures teacher owns the course containing this lesson
const ensureLessonTeacherAccess = async (lessonId, userId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return null;
  const module = await ModuleModel.findById(lesson.module);
  if (!module) return null;
  const course = await Course.findById(module.course);
  if (!course || !course.teacher.equals(userId)) return null;
  return lesson;
};

export const updateLesson = async (req, res) => {
  const lesson = await ensureLessonTeacherAccess(req.params.id, req.user._id);
  if (!lesson) return res.status(404).json({ message: 'Lesson not found or access denied' });

  const { title, content, contentType, attachments, order, durationMinutes } = req.body;
  const updates = {
    ...(title && { title: title.trim() }),
    ...(content !== undefined && { content }),
    ...(contentType && { contentType }),
    ...(attachments !== undefined && { attachments }),
    ...(order !== undefined && { order: Number(order) }),
    ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) })
  };

  const updated = await Lesson.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate('quiz')
    .populate('assignment');
  res.json(updated);
};

export const deleteLesson = async (req, res) => {
  const lesson = await ensureLessonTeacherAccess(req.params.id, req.user._id);
  if (!lesson) return res.status(404).json({ message: 'Lesson not found or access denied' });

  // Remove lesson reference from parent module
  await ModuleModel.findByIdAndUpdate(lesson.module, { $pull: { lessons: lesson._id } });

  // Delete progress entries for this lesson
  await Progress.updateMany(
    {},
    { $pull: { lessons: { lesson: lesson._id } } }
  );

  await Lesson.findByIdAndDelete(req.params.id);
  res.json({ message: 'Lesson deleted' });
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