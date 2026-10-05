const express = require('express');
const router = express.Router();
const { getSlots, configureSlot } = require('../controllers/slotController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getSlots);
router.post('/configure', protect, configureSlot);

module.exports = router;
