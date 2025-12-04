import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['video', 'pdf', 'link'], required: true },
    title: String,
    url: String,
    duration: Number
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    thumbnail: String,
    category: { type: String, default: 'General' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    tags: [{ type: String }],
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    levelRequirement: { type: Number, default: 1 },
    featured: { type: Boolean, default: false },
    resources: [resourceSchema],
    enrollmentCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

courseSchema.index({ teacher: 1 });
courseSchema.index({ title: 'text', description: 'text', tags: 1 });

export default mongoose.model('Course', courseSchema);