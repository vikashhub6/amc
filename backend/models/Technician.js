const mongoose = require('mongoose');
const { ZONES } = require('../config/constants');

const technicianSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true },
    zones: [{ type: String, enum: ZONES }], // ek technician multiple zones cover kar sakta hai
    specialization: [{ type: String }], // e.g. ['AC', 'Refrigerator']
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Technician', technicianSchema);
