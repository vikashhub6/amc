const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/technicianController');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), ctrl.getTechnicians);
router.get('/my-today-visits', authorize('technician'), ctrl.getMyTodayVisits);
router.get('/:id', authorize('admin', 'technician'), ctrl.getTechnicianById);
router.get('/:id/today-visits', authorize('admin'), ctrl.getMyTodayVisits);
router.put('/:id', authorize('admin'), ctrl.updateTechnician);

module.exports = router;
