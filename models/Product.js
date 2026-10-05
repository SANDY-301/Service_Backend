const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
    brand: { type: String, required: true },
    productName: { type: String, required: true },
    modelNumber: { type: String, required: true },
    description: { type: String, default: '' },
    warrantyPeriodMonths: { type: Number, required: true, default: 12 },
    warrantyType: { type: String, default: 'Standard Comprehensive' },
    warrantyCoverage: { type: String, default: 'Full parts & company service coverage' },
    companyServiceCharge: { type: Number, required: true, default: 500 },
    labourCharge: { type: Number, required: true, default: 300 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
