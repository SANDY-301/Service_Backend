const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
    serviceProblemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProblem', required: true },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
    warrantyStatus: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'NONE'],
      default: 'NONE',
    },
    serviceType: {
      type: String,
      enum: ['COMPANY_WARRANTY', 'COMPANY_PAID', 'LOCAL_SERVICE'],
      required: true,
    },
    selectedDate: { type: String, required: true }, // Format: YYYY-MM-DD
    selectedSlot: { type: String, enum: ['MORNING', 'EVENING'], required: true },
    serviceCharge: { type: Number, required: true, default: 0 },
    warrantyDiscount: { type: Number, required: true, default: 0 },
    labourCharge: { type: Number, required: true, default: 0 },
    finalAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'],
      default: 'PENDING',
    },
    notes: { type: String, default: '' },
    userAddress: { type: String, default: '' },
    userCity: { type: String, default: '' },
    userPincode: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
