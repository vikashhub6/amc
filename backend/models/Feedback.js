const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    serviceVisit: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceVisit', required: true, unique: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
