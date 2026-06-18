// src/models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn:  { type: Date, default: null },
    checkOut: { type: Date, default: null },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'on-leave', 'holiday'],
      default: 'present',
    },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── VIRTUAL: hours worked ────────────────────────────────────────────────────
attendanceSchema.virtual('hoursWorked').get(function () {
  if (!this.checkIn || !this.checkOut) return 0;
  const diff = this.checkOut.getTime() - this.checkIn.getTime();
  return parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
});

// ─── COMPOUND UNIQUE INDEX: one record per employee per day ──────────────────
// Prevents duplicate check-ins on the same day at the database level
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);