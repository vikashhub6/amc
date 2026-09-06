const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/clientController');

const router = express.Router();

router.use(protect, authorize('admin', 'technician'));

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('address').trim().notEmpty(),
    body('zone').notEmpty(),
  ],
  validate,
  ctrl.createClient
);

router.get('/', ctrl.getClients);
router.get('/:id', ctrl.getClientById);
router.put('/:id', ctrl.updateClient);
router.delete('/:id', authorize('admin'), ctrl.deleteClient);

module.exports = router;
