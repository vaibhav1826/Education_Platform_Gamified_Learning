import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  completed: { type: Boolean, default: false }
});

// Progress Model
// Granular tracking of what a student has done in a course.
// Which lessons did they finish? What did they score on related quizzes?

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    lessons: [lessonProgressSchema],
    score: { type: Number, default: 0 },
    completionPct: { type: Number, default: 0 },
    quizHistory: [
      {
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        score: Number,
        takenAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);