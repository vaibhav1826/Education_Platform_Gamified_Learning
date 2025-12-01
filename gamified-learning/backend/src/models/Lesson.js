import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: String,
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' }
  },
  { timestamps: true }
);

export default mongoose.model('Lesson', lessonSchema);