const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/productController');

const router = express.Router();

router.use(protect, authorize('admin', 'technician'));

router.post(
  '/',
  [
    body('client').notEmpty(),
    body('category').notEmpty(),
    body('brand').trim().notEmpty(),
    body('modelName').trim().notEmpty(),
    body('serialNumber').trim().notEmpty(),
    body('purchaseDate').isISO8601(),
  ],
  validate,
  ctrl.createProduct
);

router.get('/', ctrl.getProducts);
router.get('/:id', ctrl.getProductById);
router.put('/:id', ctrl.updateProduct);
router.delete('/:id', authorize('admin'), ctrl.deleteProduct);

module.exports = router;
