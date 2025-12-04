import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    audience: { type: String, enum: ['all', 'course'], default: 'all' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

announcementSchema.index({ course: 1, createdAt: -1 });

export default mongoose.model('Announcement', announcementSchema);

