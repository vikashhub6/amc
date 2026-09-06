const AlertLog = require('../models/AlertLog');

async function getAlertLogs(req, res, next) {
  try {
    const { event, channel, status, recipientType, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (event) filter.event = event;
    if (channel) filter.channel = channel;
    if (status) filter.status = status;
    if (recipientType) filter.recipientType = recipientType;

    const logs = await AlertLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await AlertLog.countDocuments(filter);

    res.json({ success: true, data: logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAlertLogs };
