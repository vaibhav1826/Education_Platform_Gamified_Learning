import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    timeLimit: { type: Number, default: 300 }
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);