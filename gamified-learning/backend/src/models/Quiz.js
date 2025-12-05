import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  points: { type: Number, default: 1 }
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true },
    questions: [questionSchema],
    assignedBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date },
    timeLimit: { type: Number }, // in minutes
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

quizSchema.index({ createdBy: 1 });
quizSchema.index({ assignedBatches: 1 });

export default mongoose.model('Quiz', quizSchema);
