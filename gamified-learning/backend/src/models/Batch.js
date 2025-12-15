import mongoose from 'mongoose';

// Generate a random 6-character alphanumeric code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const batchSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subject: { type: String, trim: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    inviteCode: { type: String, unique: true, sparse: true },
    allowSelfEnroll: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

batchSchema.index({ teacher: 1 });

// Auto-generate invite code before saving if not present
batchSchema.pre('save', async function (next) {
  if (!this.inviteCode) {
    let code = generateInviteCode();
    // Ensure uniqueness
    let exists = await this.constructor.findOne({ inviteCode: code });
    while (exists) {
      code = generateInviteCode();
      exists = await this.constructor.findOne({ inviteCode: code });
    }
    this.inviteCode = code;
  }
  next();
});

export default mongoose.model('Batch', batchSchema);
