const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/amcController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('admin'),
  [
    body('client').notEmpty(),
    body('product').notEmpty(),
    body('planType').isIn(['Basic', 'Standard', 'Premium']),
    body('amount').isNumeric(),
  ],
  validate,
  ctrl.createAMC
);

router.get('/', authorize('admin', 'technician'), ctrl.getAMCContracts);
router.get('/:id', authorize('admin', 'technician', 'customer'), ctrl.getAMCById);
router.put('/:id', authorize('admin'), ctrl.updateAMC);
router.post('/:id/renew', authorize('admin', 'customer'), ctrl.renewAMC);

module.exports = router;
