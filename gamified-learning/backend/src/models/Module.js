import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    order: { type: Number, default: 0 },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
  },
  { timestamps: true }
);

export default mongoose.model('Module', moduleSchema);