const mongoose = require('mongoose');
const { COMPLAINT_STATUS, COMPLAINT_PRIORITY, ZONES, SLA_HOURS } = require('../config/constants');

const complaintSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    description: { type: String, required: true },
    zone: { type: String, enum: ZONES, required: true },
    priority: { type: String, enum: COMPLAINT_PRIORITY, default: 'medium' },
    status: { type: String, enum: COMPLAINT_STATUS, default: 'open' },
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
    slaDeadline: { type: Date },
    resolvedAt: { type: Date },
    serviceVisit: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceVisit' },
  },
  { timestamps: true }
);

// Ticket ID auto-generate + priority ke hisaab se SLA deadline set karo
complaintSchema.pre('validate', function setDefaults(next) {
  if (!this.ticketId) {
    this.ticketId = `TCK-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
  }
  if (!this.slaDeadline) {
    const hours = SLA_HOURS[this.priority] || SLA_HOURS.medium;
    this.slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);
  }
  next();
});

complaintSchema.index({ zone: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
