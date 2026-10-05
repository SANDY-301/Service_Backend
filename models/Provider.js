const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, default: '' },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    serviceArea: { type: String, required: true },
    experienceYears: { type: Number, default: 1 },
    description: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Provider', providerSchema);
