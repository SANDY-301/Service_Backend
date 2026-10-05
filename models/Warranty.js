const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema(
  {
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    purchaseDate: { type: Date, required: true },
    warrantyMonths: { type: Number, required: true },
    warrantyEndDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'PENDING_VERIFICATION'],
      default: 'PENDING_VERIFICATION',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Warranty', warrantySchema);
