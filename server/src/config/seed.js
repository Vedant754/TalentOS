// src/config/seed.js — run with: node src/config/seed.js
require('dotenv').config();
const mongoose   = require('mongoose');
const Department = require('../models/Department');
const Employee   = require('../models/Employee');
const User       = require('../models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Clearing existing data...');

  await Promise.all([
    Department.deleteMany({}),
    Employee.deleteMany({}),
    User.deleteMany({}),
  ]);

  // Create departments
  const [engineering, hr, design] = await Department.create([
    { name: 'Engineering',  description: 'Product development' },
    { name: 'Human Resources', description: 'People operations' },
    { name: 'Design',       description: 'Product design' },
  ]);

  // Create employees
  const [ceoEmp, hrEmp, leadEmp, emp1] = await Employee.create([
    {
      firstName: 'Arjun', lastName: 'Mehta', email: 'arjun@talentos.com',
      department: engineering._id, designation: 'CEO', role: 'ceo',
      salary: 500000, phone: '9876543210',
    },
    {
      firstName: 'Priya', lastName: 'Sharma', email: 'priya@talentos.com',
      department: hr._id, designation: 'HR Manager', role: 'hr_manager',
      salary: 150000,
    },
    {
      firstName: 'Rohan', lastName: 'Verma', email: 'rohan@talentos.com',
      department: engineering._id, designation: 'Team Lead', role: 'team_lead',
      salary: 180000,
    },
    {
      firstName: 'Sneha', lastName: 'Patel', email: 'sneha@talentos.com',
      department: engineering._id, designation: 'Engineer', role: 'employee',
      salary: 120000, reportingTo: null,
    },
  ]);

  // Update reportingTo
  await Employee.findByIdAndUpdate(leadEmp._id, { reportingTo: ceoEmp._id });
  await Employee.findByIdAndUpdate(emp1._id,    { reportingTo: leadEmp._id });

  // Create user accounts (passwords auto-hashed by pre-save hook)
  await User.create([
    { email: 'arjun@talentos.com', password: 'CEO@1234',  role: 'ceo',        employee: ceoEmp._id },
    { email: 'priya@talentos.com', password: 'HR@12345',  role: 'hr_manager', employee: hrEmp._id  },
    { email: 'rohan@talentos.com', password: 'Lead@1234', role: 'team_lead',  employee: leadEmp._id },
    { email: 'sneha@talentos.com', password: 'Emp@12345', role: 'employee',   employee: emp1._id   },
  ]);

  console.log('✅ Seed complete — 3 departments, 4 employees, 4 user accounts created');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });