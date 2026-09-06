const mongoose = require('mongoose');
const { VISIT_STATUS, VISIT_TYPE } = require('../config/constants');

const partUsedSchema = new mongoose.Schema(
  {
    sparePart: { type: mongoose.Schema.Types.ObjectId, ref: 'SparePart', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const serviceVisitSchema = new mongoose.Schema(
  {
    amcContract: { type: mongoose.Schema.Types.ObjectId, ref: 'AMCContract' }, // complaint-based visit me null ho sakta hai
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: true },
    type: { type: String, enum: VISIT_TYPE, default: 'routine' },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    status: { type: String, enum: VISIT_STATUS, default: 'scheduled' },
    photosBefore: [{ type: String }],
    photosAfter: [{ type: String }],
    customerSignature: { type: String }, // canvas se base64/png file path
    partsUsed: [partUsedSchema],
    technicianNotes: { type: String },
  },
  { timestamps: true }
);

serviceVisitSchema.index({ technician: 1, scheduledDate: 1 });
serviceVisitSchema.index({ status: 1 });

module.exports = mongoose.model('ServiceVisit', serviceVisitSchema);
