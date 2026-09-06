const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    category: { type: String },
    unit: { type: String, default: 'pcs' },
    quantityInStock: { type: Number, required: true, default: 0, min: 0 },
    minStockThreshold: { type: Number, required: true, default: 5 },
    unitPrice: { type: Number, required: true, default: 0 },
    lowStockAlertSent: { type: Boolean, default: false }, // duplicate alert rokne ke liye
  },
  { timestamps: true }
);

module.exports = mongoose.model('SparePart', sparePartSchema);
