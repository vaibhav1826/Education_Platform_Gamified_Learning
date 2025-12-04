import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'true_false', 'short_answer'], default: 'mcq' },
    options: [{ type: String }],
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    points: { type: Number, default: 1 },
    explanation: String
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);