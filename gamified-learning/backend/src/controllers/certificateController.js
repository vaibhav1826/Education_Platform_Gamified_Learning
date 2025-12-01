import Progress from '../models/Progress.js';
import { generateCertificate } from '../utils/certificate.js';

export const generateCourseCertificate = async (req, res) => {
  const progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId }).populate('course user');
  if (!progress || progress.score < 70) {
    return res.status(400).json({ message: 'Complete course with minimum score 70 to unlock certificate.' });
  }
  const buffer = await generateCertificate(progress.user, progress.course, progress.score);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${progress.course.title}-certificate.pdf`);
  res.send(buffer);
};