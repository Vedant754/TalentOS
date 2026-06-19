// src/routes/leave.routes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/leave.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(protect);

router.post('/', ctrl.applyLeave);          // Anyone applies for their own leave
router.get('/',  ctrl.getAllLeaves);        // Role-scoped inside the controller

// Only Team Lead, HR, CEO can approve/reject — never a plain Employee
router.put('/:id/approve', authorize('team_lead', 'hr_manager', 'ceo'), ctrl.approveLeave);
router.put('/:id/reject',  authorize('team_lead', 'hr_manager', 'ceo'), ctrl.rejectLeave);

module.exports = router;