const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    category: {
      type: String,
      required: true,
      enum: ['AC', 'Refrigerator', 'Cooler', 'Deep Freezer', 'Water Cooler', 'Other'],
    },
    brand: { type: String, required: true },
    modelName: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true, trim: true },
    purchaseDate: { type: Date, required: true },
    warrantyExpiry: { type: Date },
    installationAddress: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
