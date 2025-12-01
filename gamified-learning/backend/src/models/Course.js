import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    levelRequirement: { type: Number, default: 1 },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);