const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { uploadPhotos } = require('../middleware/upload');
const ctrl = require('../controllers/serviceVisitController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('admin'),
  [
    body('client').notEmpty(),
    body('technician').notEmpty(),
    body('scheduledDate').isISO8601(),
  ],
  validate,
  ctrl.scheduleVisit
);

router.get('/', authorize('admin', 'technician', 'customer'), ctrl.getVisits);
router.get('/:id', authorize('admin', 'technician', 'customer'), ctrl.getVisitById);

// Ek hi field-set me photosBefore, photosAfter, signature (canvas se PNG blob) accept karo
const completeUpload = uploadPhotos.fields([
  { name: 'photosBefore', maxCount: 5 },
  { name: 'photosAfter', maxCount: 5 },
  { name: 'signature', maxCount: 1 },
]);

router.put(
  '/:id/complete',
  authorize('technician', 'admin'),
  (req, res, next) => completeUpload(req, res, (err) => (err ? next(err) : next())),
  ctrl.completeVisit
);

module.exports = router;
