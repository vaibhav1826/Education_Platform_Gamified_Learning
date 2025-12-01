import Course from '../models/Course.js';
import ModuleModel from '../models/Module.js';
import Lesson from '../models/Lesson.js';

export const getCourses = async (_req, res) => {
  const courses = await Course.find().populate({
    path: 'modules',
    populate: { path: 'lessons', populate: { path: 'quiz' } }
  });
  res.json(courses);
};

export const getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'modules',
    populate: { path: 'lessons', populate: { path: 'quiz' } }
  });
  res.json(course);
};

export const createCourse = async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json(course);
};

export const updateCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(course);
};

export const deleteCourse = async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

export const createModule = async (req, res) => {
  const module = await ModuleModel.create({ ...req.body, course: req.params.id });
  await Course.findByIdAndUpdate(req.params.id, { $push: { modules: module._id } });
  res.status(201).json(module);
};

export const createLesson = async (req, res) => {
  const moduleId = req.params.moduleId || req.body.module;
  const lesson = await Lesson.create({ ...req.body, module: moduleId });
  await ModuleModel.findByIdAndUpdate(moduleId, { $push: { lessons: lesson._id } });
  res.status(201).json(lesson);
};

export const getLesson = async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate('quiz');
  res.json(lesson);
};