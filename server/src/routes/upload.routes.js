// src/routes/upload.routes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { uploadPhoto, uploadDocuments } = require('../config/multer');

router.use(protect);

// Self-service photo upload — multer runs BEFORE the controller
// so req.file is ready when uploadMyPhoto executes
router.put('/me/photo', uploadPhoto, ctrl.uploadMyPhoto);

// Only HR/CEO can attach documents to ANY employee record
router.post(
  '/:id/documents',
  authorize('hr_manager', 'ceo'),
  uploadDocuments,
  ctrl.uploadEmployeeDocuments
);

router.delete(
  '/:id/documents/:docId',
  authorize('hr_manager', 'ceo'),
  ctrl.deleteDocument
);

router.get('/:employeeId/documents/:filename', ctrl.getSecureDocument);

module.exports = router;