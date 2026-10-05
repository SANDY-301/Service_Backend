const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ['COMPANY', 'PROVIDER'], required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    morningStart: { type: String, default: '09:00 AM' },
    morningEnd: { type: String, default: '01:00 PM' },
    morningMaxCapacity: { type: Number, default: 5 },
    morningBookedCount: { type: Number, default: 0 },
    eveningStart: { type: String, default: '02:00 PM' },
    eveningEnd: { type: String, default: '06:00 PM' },
    eveningMaxCapacity: { type: Number, default: 5 },
    eveningBookedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slot', slotSchema);
