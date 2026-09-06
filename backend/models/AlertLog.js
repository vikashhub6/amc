const mongoose = require('mongoose');

const alertLogSchema = new mongoose.Schema(
  {
    recipientType: { type: String, enum: ['customer', 'technician', 'admin'], required: true },
    recipientName: { type: String },
    recipientEmail: { type: String },
    recipientPhone: { type: String },
    event: { type: String, required: true }, // e.g. 'AMC_PURCHASE', 'SERVICE_DUE_REMINDER', 'OVERDUE_ALERT'...
    channel: { type: String, enum: ['email', 'sms'], required: true },
    subject: { type: String },
    message: { type: String },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    errorMessage: { type: String },
    // Loose refs so any module can log alerts against its own record
    relatedModel: { type: String },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

alertLogSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model('AlertLog', alertLogSchema);
