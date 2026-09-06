const mongoose = require('mongoose');
const { ZONES } = require('../config/constants');

const clientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // agar client portal login hai
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, required: true },
    city: { type: String, default: 'Vapi' },
    pincode: { type: String },
    zone: { type: String, enum: ZONES, required: true },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

clientSchema.index({ name: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Client', clientSchema);
