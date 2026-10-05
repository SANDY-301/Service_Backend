const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getAdminBookings,
  getBookingById,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/provider-bookings', protect, authorizeRoles('PROVIDER', 'ADMIN'), getProviderBookings);
router.get('/admin-bookings', protect, authorizeRoles('ADMIN'), getAdminBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
