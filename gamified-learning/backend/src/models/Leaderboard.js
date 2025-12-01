import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }]
  },
  { timestamps: true }
);

export default mongoose.model('Leaderboard', leaderboardSchema);