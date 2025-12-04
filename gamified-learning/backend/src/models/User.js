import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const streakSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
  lastLogin: Date
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String },
    googleId: { type: String, index: true },
    avatar: String,
    profileImage: { type: String, default: '' },
    city: { type: String, trim: true },
    phone: { type: String, trim: true },
    specialization: { type: String, trim: true },
    experience: { type: Number, min: 0 },
    role: { type: String, enum: ['student', 'teacher', 'admin'], required: true, default: 'student' },
    authProvider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
    refreshToken: String,
    streak: { type: streakSchema, default: () => ({ count: 0 }) }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

userSchema.methods.safeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

export default mongoose.model('User', userSchema);