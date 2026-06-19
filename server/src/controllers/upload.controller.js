// src/controllers/upload.controller.js
const fs = require('fs');
const path = require('path');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ─── PUT /api/employees/me/photo ───────────────────────────────────────────
// Self-service — any role can update their OWN photo (no authorize() needed)
const uploadMyPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const employee = await Employee.findById(req.user.employee);
  if (!employee) throw new AppError('Employee profile not found', 404);

  // Delete the OLD photo file from disk before saving the new path
  // Otherwise every re-upload leaks an orphaned file on disk forever
  if (employee.profilePhoto) {
    const oldPath = path.join(__dirname, '../../', employee.profilePhoto);
    fs.unlink(oldPath, (err) => {
      // Log but don't fail the request if cleanup fails — not user's fault
      if (err && err.code !== 'ENOENT') console.error('Old photo cleanup failed:', err);
    });
  }

  // Store a relative path, never the absolute filesystem path
  // (absolute paths leak server directory structure if ever exposed)
  employee.profilePhoto = `/uploads/photos/${req.file.filename}`;
  await employee.save();

  res.status(200).json({
    success: true,
    message: 'Profile photo updated',
    data: { profilePhoto: employee.profilePhoto },
  });
});

// ─── POST /api/employees/:id/documents ─────────────────────────────────────
// Only HR/CEO can upload documents to ANOTHER employee's file
// (RBAC route guard handles this — see Step 6)
const uploadEmployeeDocuments = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const employee = await Employee.findById(req.params.id);
  if (!employee) throw new AppError('Employee not found', 404);

  // Build document sub-documents from the uploaded files
  const newDocuments = req.files.map(file => ({
    name: req.body.documentName || file.originalname, // display name only
    fileUrl: `/uploads/documents/${file.filename}`,
    fileType: file.mimetype,
  }));

  employee.documents.push(...newDocuments);
  await employee.save();

  res.status(201).json({
    success: true,
    message: `${req.files.length} document(s) uploaded`,
    data: employee.documents,
  });
});

// ─── DELETE /api/employees/:id/documents/:docId ────────────────────────────
const deleteDocument = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) throw new AppError('Employee not found', 404);

  const doc = employee.documents.id(req.params.docId); // Mongoose subdoc lookup by _id
  if (!doc) throw new AppError('Document not found', 404);

  // Remove the actual file from disk
  const filePath = path.join(__dirname, '../../', doc.fileUrl);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error('Document file cleanup failed:', err);
  });

  doc.deleteOne(); // removes the subdocument from the array
  await employee.save();

  res.status(200).json({ success: true, message: 'Document deleted' });
});

const getSecureDocument = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.employeeId);
  if (!employee) throw new AppError('Employee not found', 404);

  const doc = employee.documents.find(d => d.fileUrl.endsWith(req.params.filename));
  if (!doc) throw new AppError('Document not found', 404);

  // RBAC check — same rule as viewing the employee record itself
  const { role, employee: myId } = req.user;
  const isOwner = String(employee._id) === String(myId);
  const isPrivileged = ['ceo', 'hr_manager'].includes(role);
  const isManager = role === 'team_lead' && String(employee.reportingTo) === String(myId);

  if (!isOwner && !isPrivileged && !isManager) {
    throw new AppError('You do not have permission to view this document', 403);
  }

  const filePath = path.join(__dirname, '../../uploads/documents', req.params.filename);
  res.sendFile(filePath);
});

module.exports = { uploadMyPhoto, uploadEmployeeDocuments, deleteDocument,getSecureDocument};