// src/controllers/leave.controller.js
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/leaves — anyone applies for their OWN leave
const applyLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.create({
    ...req.body,
    employee: req.user.employee, // Always the logged-in user — never from req.body
  });
  res.status(201).json({ success: true, data: leave });
});

// GET /api/leaves — role-scoped list, same pattern as employees
const getAllLeaves = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === 'employee') {
    filter.employee = req.user.employee; // Only own leaves
  } else if (req.user.role === 'team_lead') {
    // Leaves belonging to direct reports
    const reports = await Employee.find({ reportingTo: req.user.employee }).select('_id');
    const reportIds = reports.map(r => r._id);
    filter.employee = { $in: [...reportIds, req.user.employee] };
  }
  // ceo/hr_manager → no filter, see all leave requests

  if (req.query.status) filter.status = req.query.status;

  const leaves = await Leave.find(filter)
    .populate('employee', 'firstName lastName designation')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: leaves.length, data: leaves });
});

// PUT /api/leaves/:id/approve — Team Lead (own reports only) or HR/CEO (anyone)
const approveLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id).populate('employee');
  if (!leave) throw new AppError('Leave request not found', 404);

  // Authorization check happens HERE, not just at the route level,
  // because it depends on the SPECIFIC leave's employee
  if (req.user.role === 'team_lead') {
    if (String(leave.employee.reportingTo) !== String(req.user.employee)) {
      throw new AppError('You can only approve leave for your direct reports', 403);
    }
  }
  // hr_manager and ceo can approve anyone's leave — no extra check needed

  leave.status = 'approved';
  leave.approvedBy = req.user.employee;
  leave.approvedAt = new Date();
  await leave.save();

  res.status(200).json({ success: true, data: leave });
});

const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id).populate('employee');
  if (!leave) throw new AppError('Leave request not found', 404);

  if (req.user.role === 'team_lead' &&
      String(leave.employee.reportingTo) !== String(req.user.employee)) {
    throw new AppError('You can only reject leave for your direct reports', 403);
  }

  leave.status = 'rejected';
  leave.rejectionReason = req.body.reason || 'Not specified';
  await leave.save();

  res.status(200).json({ success: true, data: leave });
});

module.exports = { applyLeave, getAllLeaves, approveLeave, rejectLeave };