// src/models/Employee.js
const mongoose = require('mongoose');

// Sub-schema for embedded documents — these don't get their own collection
const emergencyContactSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  relationship: { type: String, required: true },
  phone:        { type: String, required: true },
}, { _id: false }); // _id: false — no ObjectId for embedded sub-docs

const documentSchema = new mongoose.Schema({
  name:       { type: String, required: true }, // "Offer Letter", "ID Proof"
  fileUrl:    { type: String, required: true }, // Path from Phase 6 file upload
  uploadedAt: { type: Date, default: Date.now },
  fileType:   { type: String },
}, { _id: true }); // _id: true — each document gets its own ID for updates/deletes

const employeeSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },

    // Reference to Department — stored as ObjectId, populated on demand
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },

    // Role in the company — drives dashboard access (Phase 4 & 5)
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      enum: {
        values: ['CEO', 'HR Manager', 'Team Lead', 'Senior Engineer',
                 'Engineer', 'Designer', 'Analyst', 'Intern'],
        message: '{VALUE} is not a valid designation',
      },
    },

    // System role — controls what the user can access
    role: {
      type: String,
      enum: ['ceo', 'hr_manager', 'team_lead', 'employee'],
      default: 'employee',
    },

    salary: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },

    joinDate: {
      type: Date,
      default: Date.now,
    },

    profilePhoto: {
      type: String, // URL/path — actual file handled in Phase 6
      default: null,
    },

    // Array of embedded document objects
    documents: [documentSchema],

    // Single embedded object
    emergencyContact: emergencyContactSchema,

    isActive: {
      type: Boolean,
      default: true,
    },

    // For reporting structure — who does this employee report to?
    reportingTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── VIRTUAL: full name ───────────────────────────────────────────────────────
// Computed from firstName + lastName — no need to store or sync a separate field
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ─── VIRTUAL: years of service ───────────────────────────────────────────────
employeeSchema.virtual('yearsOfService').get(function () {
  if (!this.joinDate) return 0;
  const diff = Date.now() - this.joinDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
});

// ─── INDEXES ─────────────────────────────────────────────────────────────────
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ isActive: 1 });
// Compound index — speeds up "get all active employees in a department"
employeeSchema.index({ department: 1, isActive: 1 });

// ─── QUERY MIDDLEWARE ─────────────────────────────────────────────────────────
// This hook runs before any find() — automatically filters out inactive employees
// So every query gets only active employees unless explicitly overridden
employeeSchema.pre(/^find/, function () {
  // 'this' is the query object
  if (this.getOptions().includeInactive) return next();
  this.find({ isActive: { $ne: false } });
//   next();
});

module.exports = mongoose.model('Employee', employeeSchema);