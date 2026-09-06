const Feedback = require('../models/Feedback');
const ServiceVisit = require('../models/ServiceVisit');

async function createFeedback(req, res, next) {
  try {
    const { serviceVisit, rating, comment } = req.body;
    const visit = await ServiceVisit.findById(serviceVisit);
    if (!visit) return res.status(404).json({ success: false, message: 'Service visit not found' });
    if (visit.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Feedback allowed only after service completion' });
    }

    const feedback = await Feedback.create({
      client: visit.client,
      serviceVisit,
      technician: visit.technician,
      rating,
      comment,
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
}

async function getFeedbacks(req, res, next) {
  try {
    const { technician, client } = req.query;
    const filter = {};
    if (technician) filter.technician = technician;
    if (client) filter.client = client;

    const feedbacks = await Feedback.find(filter)
      .populate('client', 'name')
      .populate('technician', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: feedbacks });
  } catch (err) {
    next(err);
  }
}

module.exports = { createFeedback, getFeedbacks };
