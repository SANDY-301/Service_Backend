const mongoose = require('mongoose');

const providerServiceSchema = new mongoose.Schema(
  {
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProblem', required: true },
    serviceCharge: { type: Number, required: true, default: 400 },
    labourCharge: { type: Number, required: true, default: 200 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProviderService', providerServiceSchema);
