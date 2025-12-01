import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  completed: { type: Boolean, default: false }
});

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    lessons: [lessonProgressSchema],
    score: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Progress', progressSchema);