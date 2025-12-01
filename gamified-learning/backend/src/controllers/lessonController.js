import Lesson from '../models/Lesson.js';

export const getLesson = async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate('quiz');
  res.json(lesson);
};