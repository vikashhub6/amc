const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAlertLogs } = require('../controllers/alertLogController');
const { runAllDailyChecks } = require('../services/alertScheduler');

const router = express.Router();

router.get('/', protect, authorize('admin'), getAlertLogs);

// Manual trigger for testing - production me yeh cron se hi chalta hai (roz 8 AM)
router.post('/run-daily-checks', protect, authorize('admin'), async (req, res, next) => {
  try {
    await runAllDailyChecks();
    res.json({ success: true, message: 'Daily alert checks executed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
