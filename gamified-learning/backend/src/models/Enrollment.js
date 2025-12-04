import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['enrolled', 'completed', 'dropped'], default: 'enrolled' },
    progressPct: { type: Number, default: 0 },
    quizAverage: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

enrollmentSchema.index({ course: 1, student: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);

