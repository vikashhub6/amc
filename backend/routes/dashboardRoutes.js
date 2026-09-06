const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/summary', ctrl.getAdminSummary);
router.get('/monthly-trend', ctrl.getMonthlyTrend);
router.get('/area-wise', ctrl.getAreaWiseReport);

module.exports = router;
