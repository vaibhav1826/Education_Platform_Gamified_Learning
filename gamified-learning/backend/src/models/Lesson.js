import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['video', 'pdf', 'link'], default: 'video' },
    title: String,
    url: String,
    duration: Number
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: String,
    contentType: { type: String, enum: ['video', 'article', 'interactive'], default: 'article' },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    attachments: [attachmentSchema],
    order: { type: Number, default: 0 },
    durationMinutes: { type: Number, default: 5 }
  },
  { timestamps: true }
);

export default mongoose.model('Lesson', lessonSchema);