import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedIndex: { type: Number, required: true },
  isCorrect: { type: Boolean, default: false }
});

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['quiz', 'assignment'], default: 'quiz' },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, default: 0 },
    answers: [answerSchema], // For quizzes
    fileUrl: { type: String }, // For assignments
    feedback: { type: String }, // Teacher feedback
    status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

submissionSchema.index({ student: 1, quiz: 1 });
submissionSchema.index({ batch: 1 });
submissionSchema.index({ quiz: 1 });
submissionSchema.index({ teacher: 1 });

export default mongoose.model('Submission', submissionSchema);

