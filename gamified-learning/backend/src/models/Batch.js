import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subject: { type: String, trim: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

batchSchema.index({ teacher: 1 });

export default mongoose.model('Batch', batchSchema);

