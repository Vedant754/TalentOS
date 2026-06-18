// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // NEVER returned in queries by default — must opt in with .select('+password')
    },
    role: {
      type: String,
      enum: ['ceo', 'hr_manager', 'team_lead', 'employee'],
      default: 'employee',
    },
    // 1:1 link to Employee profile
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // For refresh token rotation (Phase 4)
    refreshToken: {
      type: String,
      select: false,
    },
    // Password reset flow
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ─── DOCUMENT MIDDLEWARE: Hash password before saving ─────────────────────────
// 'pre save' hook — runs before every .save() call
// Only re-hashes if the password field was actually modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  // 12 salt rounds — each round doubles the time to crack
  // 10 rounds ≈ 10ms, 12 rounds ≈ 40ms — sweet spot for security vs UX
  this.password = await bcrypt.hash(this.password, 12);
//   next();
});

// ─── INSTANCE METHOD: Compare password at login ───────────────────────────────
// 'this' is the document instance
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── INSTANCE METHOD: Update last login ───────────────────────────────────────
userSchema.methods.recordLogin = async function () {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

// userSchema.index({ email: 1 });
userSchema.index({ employee: 1 });

module.exports = mongoose.model('User', userSchema);