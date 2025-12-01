import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const streakSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
  lastLogin: Date
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
    refreshToken: String,
    streak: { type: streakSchema, default: () => ({ count: 0 }) }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);