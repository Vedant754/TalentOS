// src/models/Department.js
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    // The employee who leads this department
    // ObjectId reference — Mongoose will populate this with full Employee data when asked
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,         // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true }, // Include virtual fields when serialized
    toObject: { virtuals: true },
  }
);

// VIRTUAL FIELD — computed, not stored in DB
// Gives you dept.headCount from a separate query
// In Phase 5 we'll use aggregation pipelines for this
departmentSchema.virtual('headCount', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'department',
  count: true, // Just count, don't fetch full docs
});

// INDEX — speeds up queries that filter by isActive
// Note: `unique: true` on `name` already creates an index, avoid duplicating it
departmentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Department', departmentSchema);