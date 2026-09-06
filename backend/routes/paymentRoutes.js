const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/paymentController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('admin'),
  [body('client').notEmpty(), body('amount').isNumeric(), body('dueDate').isISO8601()],
  validate,
  ctrl.createPayment
);

router.get('/', authorize('admin', 'customer'), ctrl.getPayments);
router.get('/:id', authorize('admin', 'customer'), ctrl.getPaymentById);
router.patch('/:id/mark-paid', authorize('admin'), ctrl.markAsPaid);

module.exports = router;
