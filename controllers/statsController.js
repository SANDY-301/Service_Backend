const User = require('../models/User');
const Company = require('../models/Company');
const Product = require('../models/Product');
const Bill = require('../models/Bill');
const Warranty = require('../models/Warranty');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

// @desc    Get Admin Dashboard Summary Statistics
// @route   GET /api/stats/dashboard
// @access  Private/Admin
const getAdminDashboardStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalUsers,
      totalCompanies,
      totalProducts,
      pendingBills,
      activeWarranties,
      activeBookings,
      pendingBookings,
      completedServices,
      totalProviders,
    ] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      Company.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Bill.countDocuments({ verificationStatus: 'PENDING' }),
      Warranty.countDocuments({ status: 'ACTIVE' }),
      Booking.countDocuments({ status: { $in: ['PENDING', 'CONFIRMED', 'ASSIGNED'] } }),
      Booking.countDocuments({ status: 'PENDING' }),
      Booking.countDocuments({ status: 'COMPLETED' }),
      Provider.countDocuments({ isActive: true }),
    ]);

    res.json({
      totalUsers,
      totalCompanies,
      totalProducts,
      pendingBills,
      activeWarranties,
      activeBookings,
      pendingBookings,
      completedServices,
      totalProviders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminDashboardStats };
