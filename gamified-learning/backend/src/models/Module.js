import mongoose from 'mongoose';

// Module Model
// Modules are chapters in the Course book.
// They organize lessons into logical groups (e.g., "Week 1: Basics").

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