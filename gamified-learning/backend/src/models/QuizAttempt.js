import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer: mongoose.Schema.Types.Mixed,
    correct: Boolean,
    pointsAwarded: { type: Number, default: 0 }
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    responses: [responseSchema],
    score: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

quizAttemptSchema.index({ quiz: 1, student: 1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);

