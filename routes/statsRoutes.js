const express = require('express');
const router = express.Router();
const { getAdminDashboardStats } = require('../controllers/statsController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorizeRoles('ADMIN'), getAdminDashboardStats);

module.exports = router;
