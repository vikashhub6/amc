const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../config/constants');

const paymentSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    amcContract: { type: mongoose.Schema.Types.ObjectId, ref: 'AMCContract' },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: PAYMENT_STATUS, default: 'pending' },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    method: { type: String, enum: ['cash', 'upi', 'card', 'bank_transfer', 'other'] },
    invoicePdfPath: { type: String },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

paymentSchema.pre('validate', function generateInvoiceNumber(next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
