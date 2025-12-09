import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    audience: { type: String, enum: ['all', 'course', 'batch'], default: 'all' },
    target: { type: String, enum: ['all', 'students', 'teachers'], default: 'all' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

announcementSchema.index({ course: 1, createdAt: -1 });
announcementSchema.index({ batch: 1, createdAt: -1 });

export default mongoose.model('Announcement', announcementSchema);

