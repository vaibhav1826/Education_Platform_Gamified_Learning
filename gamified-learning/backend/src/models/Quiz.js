import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  points: { type: Number, default: 1 }
});

// Quiz Model
// Defines a set of questions, potential time limits, and scheduling.
// Can be "Global" (for everyone) or "Private" (for specific batches).

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true },
    questions: [questionSchema],
    assignedBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date },
    timeLimit: { type: Number }, // in minutes
    isActive: { type: Boolean, default: true },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }
  },
  { timestamps: true }
);

quizSchema.index({ createdBy: 1 });
quizSchema.index({ assignedBatches: 1 });

export default mongoose.model('Quiz', quizSchema);
