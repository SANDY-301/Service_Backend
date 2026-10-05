const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProviderById,
  updateProviderServicePricing,
} = require('../controllers/providerController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getProviders);
router.get('/:id', getProviderById);
router.post('/:id/services', protect, authorizeRoles('PROVIDER', 'ADMIN'), updateProviderServicePricing);

module.exports = router;
