const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/sparePartController');

const router = express.Router();

router.use(protect);

// Technician ko sirf list dekhni hoti hai (parts-used entry ke liye), baaki sab admin-only
router.get('/', authorize('admin', 'technician'), ctrl.getSpareParts);

router.use(authorize('admin'));
router.post(
  '/',
  [body('name').trim().notEmpty(), body('code').trim().notEmpty()],
  validate,
  ctrl.createSparePart
);
router.put('/:id', ctrl.updateSparePart);
router.patch('/:id/adjust-stock', [body('delta').isNumeric()], validate, ctrl.adjustStock);
router.delete('/:id', ctrl.deleteSparePart);

module.exports = router;
