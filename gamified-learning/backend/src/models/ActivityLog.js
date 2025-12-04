import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    context: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

activityLogSchema.index({ entityType: 1, entityId: 1 });

export default mongoose.model('ActivityLog', activityLogSchema);

