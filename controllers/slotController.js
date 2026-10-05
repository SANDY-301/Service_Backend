const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

// @desc    Get or create slots for a company/provider on a specific date
// @route   GET /api/slots
// @access  Public
const getSlots = async (req, res) => {
  try {
    const { targetId, targetType, date } = req.query;

    if (!targetId || !date) {
      return res.status(400).json({ message: 'targetId and date are required' });
    }

    const type = targetType || 'COMPANY';

    let slot = await Slot.findOne({ targetId, targetType: type, date });

    if (!slot) {
      // Create default slot config if none exists for this date
      slot = await Slot.create({
        targetId,
        targetType: type,
        date,
        morningStart: '09:00 AM',
        morningEnd: '01:00 PM',
        morningMaxCapacity: 5,
        morningBookedCount: 0,
        eveningStart: '02:00 PM',
        eveningEnd: '06:00 PM',
        eveningMaxCapacity: 5,
        eveningBookedCount: 0,
      });
    }

    // Count actual active bookings for morning & evening slots
    let morningFilter = { selectedDate: date, selectedSlot: 'MORNING', status: { $ne: 'CANCELLED' } };
    let eveningFilter = { selectedDate: date, selectedSlot: 'EVENING', status: { $ne: 'CANCELLED' } };

    if (type === 'COMPANY') {
      morningFilter.companyId = targetId;
      eveningFilter.companyId = targetId;
    } else {
      morningFilter.providerId = targetId;
      eveningFilter.providerId = targetId;
    }

    const morningActiveCount = await Booking.countDocuments(morningFilter);
    const eveningActiveCount = await Booking.countDocuments(eveningFilter);

    const morningAvailable = morningActiveCount < slot.morningMaxCapacity;
    const eveningAvailable = eveningActiveCount < slot.eveningMaxCapacity;

    res.json({
      slotId: slot._id,
      date: slot.date,
      morning: {
        time: `${slot.morningStart} - ${slot.morningEnd}`,
        capacity: slot.morningMaxCapacity,
        booked: morningActiveCount,
        available: morningAvailable,
      },
      evening: {
        time: `${slot.eveningStart} - ${slot.eveningEnd}`,
        capacity: slot.eveningMaxCapacity,
        booked: eveningActiveCount,
        available: eveningAvailable,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Configure slot capacity/times (Admin or Provider)
// @route   POST /api/slots/configure
// @access  Private
const configureSlot = async (req, res) => {
  try {
    const { targetId, targetType, date, morningMaxCapacity, eveningMaxCapacity, morningStart, morningEnd, eveningStart, eveningEnd } = req.body;

    let slot = await Slot.findOne({ targetId, targetType, date });
    if (slot) {
      if (morningMaxCapacity !== undefined) slot.morningMaxCapacity = morningMaxCapacity;
      if (eveningMaxCapacity !== undefined) slot.eveningMaxCapacity = eveningMaxCapacity;
      if (morningStart) slot.morningStart = morningStart;
      if (morningEnd) slot.morningEnd = morningEnd;
      if (eveningStart) slot.eveningStart = eveningStart;
      if (eveningEnd) slot.eveningEnd = eveningEnd;

      await slot.save();
    } else {
      slot = await Slot.create({
        targetId,
        targetType,
        date,
        morningMaxCapacity: morningMaxCapacity || 5,
        eveningMaxCapacity: eveningMaxCapacity || 5,
        morningStart: morningStart || '09:00 AM',
        morningEnd: morningEnd || '01:00 PM',
        eveningStart: eveningStart || '02:00 PM',
        eveningEnd: eveningEnd || '06:00 PM',
      });
    }

    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSlots, configureSlot };
