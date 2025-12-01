import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);