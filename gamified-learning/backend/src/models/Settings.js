import mongoose from 'mongoose';

const xpRuleSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    xp: { type: Number, default: 0 }
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    xpRules: [xpRuleSchema],
    levelThresholds: [{ type: Number }],
    badgeCriteria: { type: mongoose.Schema.Types.Mixed },
    allowedDifficulties: [{ type: String }],
    branding: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({
      xpRules: [
        { action: 'quiz.correct', xp: 10 },
        { action: 'quiz.submit', xp: 20 }
      ],
      levelThresholds: [0, 100, 300, 600, 1000],
      allowedDifficulties: ['beginner', 'intermediate', 'advanced']
    });
  }
  return doc;
};

export default mongoose.model('Settings', settingsSchema);

