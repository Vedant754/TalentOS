// src/models/Leave.js
const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    type: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: ['sick', 'casual', 'earned', 'maternity', 'paternity', 'unpaid'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    approvedAt:  { type: Date, default: null },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true }
);

// ─── VIRTUAL: number of days ──────────────────────────────────────────────────
leaveSchema.virtual('numberOfDays').get(function () {
  if (!this.startDate || !this.endDate) return 0;
  const diff = this.endDate.getTime() - this.startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
});

// ─── SCHEMA-LEVEL VALIDATION: endDate must be after startDate ─────────────────
leaveSchema.pre('validate', function (next) {
  if (this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

leaveSchema.index({ employee: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Leave', leaveSchema);