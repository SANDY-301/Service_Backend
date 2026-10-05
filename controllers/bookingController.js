const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Bill = require('../models/Bill');
const Warranty = require('../models/Warranty');
const Product = require('../models/Product');
const ProviderService = require('../models/ProviderService');

// @desc    Create a new booking with double booking prevention
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const {
      companyId,
      providerId,
      productId,
      categoryId,
      serviceProblemId,
      billId,
      warrantyStatus,
      serviceType,
      selectedDate,
      selectedSlot,
      notes,
      userAddress,
      userCity,
      userPincode,
    } = req.body;

    if (!categoryId || !serviceProblemId || !selectedDate || !selectedSlot || !serviceType) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    const targetId = serviceType === 'LOCAL_SERVICE' ? providerId : companyId;
    const targetType = serviceType === 'LOCAL_SERVICE' ? 'PROVIDER' : 'COMPANY';

    if (!targetId) {
      return res.status(400).json({ message: 'Valid company or service provider is required for booking' });
    }

    // 1. OVERBOOKING & DOUBLE BOOKING PREVENTION VALIDATION
    let slot = await Slot.findOne({ targetId, targetType, date: selectedDate });
    const maxCapacity = slot
      ? selectedSlot === 'MORNING'
        ? slot.morningMaxCapacity
        : slot.eveningMaxCapacity
      : 5;

    let countFilter = {
      selectedDate,
      selectedSlot,
      status: { $ne: 'CANCELLED' },
    };

    if (targetType === 'COMPANY') {
      countFilter.companyId = targetId;
    } else {
      countFilter.providerId = targetId;
    }

    const activeBookingsCount = await Booking.countDocuments(countFilter);

    if (activeBookingsCount >= maxCapacity) {
      return res.status(400).json({
        message: `The selected ${selectedSlot.toLowerCase()} slot for ${selectedDate} is fully booked (${activeBookingsCount}/${maxCapacity}). Please select another slot or date.`,
      });
    }

    // 2. PRICING CALCULATION
    let serviceCharge = 0;
    let warrantyDiscount = 0;
    let labourCharge = 0;
    let finalAmount = 0;

    if (serviceType === 'COMPANY_WARRANTY' || serviceType === 'COMPANY_PAID') {
      const prod = productId ? await Product.findById(productId) : null;
      serviceCharge = prod ? prod.companyServiceCharge : 500;
      labourCharge = prod ? prod.labourCharge : 300;

      if (serviceType === 'COMPANY_WARRANTY' && warrantyStatus === 'ACTIVE') {
        warrantyDiscount = serviceCharge; // Full service charge covered under active warranty
      } else {
        warrantyDiscount = 0;
      }
    } else if (serviceType === 'LOCAL_SERVICE') {
      const ps = await ProviderService.findOne({
        providerId,
        categoryId,
        problemId: serviceProblemId,
      });

      serviceCharge = ps ? ps.serviceCharge : 400;
      labourCharge = ps ? ps.labourCharge : 200;
      warrantyDiscount = 0;
    }

    const netServiceCharge = Math.max(0, serviceCharge - warrantyDiscount);
    finalAmount = Math.max(0, netServiceCharge + labourCharge);

    // 3. CREATE BOOKING RECORD
    const booking = await Booking.create({
      userId: req.user._id,
      companyId: serviceType !== 'LOCAL_SERVICE' ? companyId : null,
      providerId: serviceType === 'LOCAL_SERVICE' ? providerId : null,
      productId: productId || null,
      categoryId,
      serviceProblemId,
      billId: billId || null,
      warrantyStatus: warrantyStatus || 'NONE',
      serviceType,
      selectedDate,
      selectedSlot,
      serviceCharge,
      warrantyDiscount,
      labourCharge,
      finalAmount,
      status: 'CONFIRMED',
      notes: notes || '',
      userAddress: userAddress || req.user.address || '',
      userCity: userCity || req.user.city || '',
      userPincode: userPincode || req.user.pincode || '',
    });

    // Notify via Socket.IO real-time event if available
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_booking', { bookingId: booking._id, serviceType, status: booking.status });
    }

    res.status(201).json({
      message: 'Booking confirmed successfully!',
      booking,
    });
  } catch (error) {
    console.error('Booking Creation Error:', error);
    res.status(500).json({ message: error.message || 'Server error creating booking' });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('companyId', 'companyName mobile city')
      .populate('providerId', 'name mobile city serviceArea')
      .populate('productId', 'brand productName modelNumber')
      .populate('categoryId', 'name icon')
      .populate('serviceProblemId', 'problemName')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get provider assigned bookings
// @route   GET /api/bookings/provider-bookings
// @access  Private/Provider
const getProviderBookings = async (req, res) => {
  try {
    const providerId = req.user.providerId || req.query.providerId;
    const bookings = await Booking.find({ providerId })
      .populate('userId', 'name email mobile address city pincode')
      .populate('categoryId', 'name icon')
      .populate('serviceProblemId', 'problemName')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all admin bookings
// @route   GET /api/bookings/admin-bookings
// @access  Private/Admin
const getAdminBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email mobile')
      .populate('companyId', 'companyName')
      .populate('providerId', 'name mobile')
      .populate('productId', 'brand productName modelNumber')
      .populate('categoryId', 'name icon')
      .populate('serviceProblemId', 'problemName')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email mobile address city pincode')
      .populate('companyId')
      .populate('providerId')
      .populate('productId')
      .populate('categoryId')
      .populate('serviceProblemId')
      .populate('billId');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Admin / Provider / User)
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();

    // Notify via Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      io.emit(`booking_updated_${booking._id}`, { status: booking.status });
      io.emit('booking_status_change', { bookingId: booking._id, status: booking.status });
    }

    res.json({ message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getAdminBookings,
  getBookingById,
  updateBookingStatus,
};
