const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/feedbackController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('customer', 'admin'),
  [body('serviceVisit').notEmpty(), body('rating').isInt({ min: 1, max: 5 })],
  validate,
  ctrl.createFeedback
);
router.get('/', authorize('admin'), ctrl.getFeedbacks);

module.exports = router;
