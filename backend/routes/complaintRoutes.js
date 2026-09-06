const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/complaintController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('admin', 'customer'),
  [body('client').notEmpty(), body('description').trim().notEmpty()],
  validate,
  ctrl.createComplaint
);

router.get('/', authorize('admin', 'technician', 'customer'), ctrl.getComplaints);
router.get('/:id', authorize('admin', 'technician', 'customer'), ctrl.getComplaintById);
router.patch(
  '/:id/status',
  authorize('admin', 'technician'),
  [body('status').isIn(['open', 'assigned', 'in_progress', 'resolved', 'closed'])],
  validate,
  ctrl.updateComplaintStatus
);
router.patch('/:id/reassign', authorize('admin'), [body('technicianId').notEmpty()], validate, ctrl.reassignComplaint);

module.exports = router;
