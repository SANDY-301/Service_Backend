const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    imagePath: { type: String, required: true },
    originalFileName: { type: String, default: '' },
    mimeType: { type: String, default: 'image/jpeg' },
    rawOcrText: { type: String, default: '' },
    parsedOcrData: {
      invoiceNumber: { type: String, default: '' },
      purchaseDate: { type: String, default: '' },
      customerName: { type: String, default: '' },
      productName: { type: String, default: '' },
      brand: { type: String, default: '' },
      modelNumber: { type: String, default: '' },
      serialNumber: { type: String, default: '' },
      totalAmount: { type: String, default: '' },
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'NEEDS_REVIEW'],
      default: 'PENDING',
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);
