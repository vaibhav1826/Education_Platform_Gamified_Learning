import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    timeLimit: { type: Number, default: 300 }, // seconds
    autoGrade: { type: Boolean, default: true },
    passingScore: { type: Number, default: 70 },
    totalPoints: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' }
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);