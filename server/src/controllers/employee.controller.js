// // Controllers only handle request/response.
// // They call services or models for actual logic.

// const asyncHandler = require('../utils/asyncHandler');

// const getAllEmployees = asyncHandler(async (req, res) => {
//   const employees = await Employee.find();
//   res.json({ success: true, data: employees });
//   // If Employee.find() throws, asyncHandler catches it and calls next(error)
//   // which hits the global error handler in app.js
// });

// const createEmployee = asyncHandler(async (req, res) => {
//   const { name, email, role, department } = req.body;

//   // Basic validation (Phase 7 will make this production-grade)
//   if (!name || !email) {
//     throw new Error('Name and email are required');
//   }

//   res.status(201).json({     // 201 = Created (not 200)
//     success: true,
//     message: 'Employee created',
//     data: { name, email, role, department }
//   });
// });

// const getEmployee = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   res.status(200).json({ success: true, data: { id, name: 'Sample Employee' } });
// });

// const updateEmployee = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   res.status(200).json({ success: true, message: `Employee ${id} updated`, data: req.body });
// });

// const deleteEmployee = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   res.status(200).json({ success: true, message: `Employee ${id} deleted` });
// });

// module.exports = { getAllEmployees, createEmployee, getEmployee, updateEmployee, deleteEmployee };
     

// src/controllers/employee.controller.js
const Employee   = require('../models/Employee');
const Department = require('../models/Department');
const AppError   = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ─── GET /api/employees ────────────────────────────────────────────────────────
const getAllEmployees = asyncHandler(async (req, res) => {
  // Query builder — build the filter from query params
  const filter = {};

  // ?department=64abc → filter by department ID
  if (req.query.department) filter.department = req.query.department;

  // ?role=team_lead → filter by role
  if (req.query.role) filter.role = req.query.role;

  // ?search=priya → search name or email (case-insensitive)
  if (req.query.search) {
    filter.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName:  { $regex: req.query.search, $options: 'i' } },
      { email:     { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Pagination
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  // Sorting — ?sort=-joinDate sorts newest first (- means descending)
  const sort = req.query.sort
    ? req.query.sort.split(',').join(' ')
    : '-createdAt';

  // Execute query with populate — replaces ObjectId with full Department doc
  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate('department', 'name')       // Only fetch name field from Department
      .populate('reportingTo', 'firstName lastName designation')
      .select('-documents -emergencyContact') // Exclude sensitive fields from list view
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Employee.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count:   employees.length,
    total,
    page,
    pages:   Math.ceil(total / limit),
    data:    employees,
  });
});

// ─── GET /api/employees/:id ────────────────────────────────────────────────────
const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('department',  'name description')
    .populate('reportingTo', 'firstName lastName designation email');

  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  res.status(200).json({ success: true, data: employee });
});

// ─── POST /api/employees ───────────────────────────────────────────────────────
const createEmployee = asyncHandler(async (req, res) => {
  const {
    firstName, lastName, email, phone,
    department, designation, role, salary,
    joinDate, reportingTo, emergencyContact,
  } = req.body;

  // Check department actually exists before referencing it
  const dept = await Department.findById(department);
  if (!dept) throw new AppError('Department not found', 404);

  // Check email uniqueness ourselves for a cleaner error message
  const existing = await Employee.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError('An employee with this email already exists', 409);

  const employee = await Employee.create({
    firstName, lastName, email, phone,
    department, designation, role, salary,
    joinDate, reportingTo, emergencyContact,
  });

  // Populate before responding so the client gets full objects, not raw IDs
  await employee.populate('department', 'name');

  res.status(201).json({ success: true, data: employee });
});

// ─── PUT /api/employees/:id ────────────────────────────────────────────────────
const updateEmployee = asyncHandler(async (req, res) => {
  // Fields that must NEVER be updated via this route
  const disallowed = ['password', 'role', 'email'];
  disallowed.forEach(field => delete req.body[field]);
  // Role changes go through a dedicated /api/employees/:id/role route (Phase 5)
  // Email changes need verification flow — separate route

  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new:            true,  // Return the updated document, not the original
      runValidators:  true,  // Run schema validators on the updated fields
    }
  ).populate('department', 'name');

  if (!employee) throw new AppError('Employee not found', 404);

  res.status(200).json({ success: true, data: employee });
});

// ─── DELETE /api/employees/:id ─────────────────────────────────────────────────
// Soft delete — we NEVER hard delete employees (historical leave/attendance data)
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) throw new AppError('Employee not found', 404);

  // Soft delete: set isActive to false — the pre-find hook hides them from all queries
  employee.isActive = false;
  await employee.save();

  // Also deactivate their user account
  await require('../models/User').findOneAndUpdate(
    { employee: req.params.id },
    { isActive: false }
  );

  res.status(200).json({
    success: true,
    message: 'Employee deactivated successfully',
  });
});

// ─── POST /api/employees/:id/documents ────────────────────────────────────────
// Add a document to the employee's documents array (wired up fully in Phase 6)
const addDocument = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { $push: { documents: req.body } }, // $push appends to the array
    { new: true, runValidators: true }
  );

  if (!employee) throw new AppError('Employee not found', 404);
  res.status(201).json({ success: true, data: employee.documents });
});

// ─── GET /api/employees/stats ─────────────────────────────────────────────────
// Aggregation pipeline — for the CEO/HR dashboard
const getEmployeeStats = asyncHandler(async (req, res) => {
  const stats = await Employee.aggregate([
    { $match: { isActive: true } },

    // Group by role, count employees, calculate average salary
    {
      $group: {
        _id: '$role',
        count:     { $sum: 1 },
        avgSalary: { $avg: '$salary' },
        minSalary: { $min: '$salary' },
        maxSalary: { $max: '$salary' },
      },
    },

    // Rename _id to role for cleaner output
    {
      $project: {
        role:      '$_id',
        count:     1,
        avgSalary: { $round: ['$avgSalary', 2] },
        minSalary: 1,
        maxSalary: 1,
        _id:       0,
      },
    },

    { $sort: { count: -1 } },
  ]);

  // Also get department breakdown
  const deptBreakdown = await Employee.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id:   '$department',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {              // JOIN with Department collection
        from:         'departments',
        localField:   '_id',
        foreignField: '_id',
        as:           'department',
      },
    },
    { $unwind: '$department' },
    {
      $project: {
        departmentName: '$department.name',
        count:          1,
        _id:            0,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: { byRole: stats, byDepartment: deptBreakdown },
  });
});

module.exports = {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addDocument,
  getEmployeeStats,
};