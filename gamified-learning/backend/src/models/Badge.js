import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['streak', 'achievement', 'rare'], default: 'achievement' },
    criteria: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Badge', badgeSchema);