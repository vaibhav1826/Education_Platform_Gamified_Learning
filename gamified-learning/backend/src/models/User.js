import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User Model
// This is the heart of our user management. It defines what a "User" looks like
// in our database and handles security stuff like password hashing.

const streakSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
  lastLogin: Date
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String },

    avatar: String,
    profileImage: { type: String, default: '' },
    city: { type: String, trim: true },
    phone: { type: String, trim: true },
    specialization: { type: String, trim: true },
    experience: { type: Number, min: 0 },
    role: { type: String, enum: ['student', 'teacher', 'admin'], required: true, default: 'student' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },

    // Gamification Stats
    // Everyone starts at level 1 with 0 XP. Gotta grind to level up!
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],

    // Security Tokens
    refreshToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Engagement Tracking
    // We track streaks to keep students coming back daily.
    streak: { type: streakSchema, default: () => ({ count: 0 }) }
  },
  { timestamps: true }
);

// Pre-save Hook: The "Magic" Password Hasher
// Before we save a user to the DB, we check if the password has changed.
// If it has, we hash it so raw passwords represent stored in our DB.
// Safety first!
userSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

// Helper: Sanitize User Object
// When we send user data to the frontend, we DON'T want to send sensitive info.
// This method returns a clean version of the user object without passwords or tokens.
userSchema.methods.safeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  // Normalize avatar fields for frontend compatibility
  if (!obj.profileImage && obj.avatar) obj.profileImage = obj.avatar;
  if (!obj.avatar && obj.profileImage) obj.avatar = obj.profileImage;
  return obj;
};

export default mongoose.model('User', userSchema);