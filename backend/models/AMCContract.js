const mongoose = require('mongoose');
const { AMC_PLAN_TYPES, AMC_STATUS } = require('../config/constants');

const amcContractSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    planType: { type: String, enum: AMC_PLAN_TYPES, required: true },
    amount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // Saal me kitni service visits included hain plan me (e.g. Basic=2, Standard=3, Premium=4)
    totalServicesIncluded: { type: Number, required: true },
    servicesCompleted: { type: Number, default: 0 },
    // Har kitne mahine me ek service due hogi -> nextServiceDate auto calculate hone ke liye
    serviceFrequencyMonths: { type: Number, required: true },
    nextServiceDate: { type: Date, required: true },
    status: { type: String, enum: AMC_STATUS, default: 'active' },
    // Reminder flags taaki cron job duplicate alert na bheje
    remindersSent: {
      renewal30: { type: Boolean, default: false },
      renewal15: { type: Boolean, default: false },
      serviceDue7: { type: Boolean, default: false },
      serviceDue3: { type: Boolean, default: false },
      serviceDue1: { type: Boolean, default: false },
      overdue: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

amcContractSchema.index({ client: 1 });
amcContractSchema.index({ nextServiceDate: 1 });
amcContractSchema.index({ endDate: 1 });

module.exports = mongoose.model('AMCContract', amcContractSchema);
