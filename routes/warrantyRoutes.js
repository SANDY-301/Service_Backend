const express = require('express');
const router = express.Router();
const { checkWarranty } = require('../controllers/warrantyController');

router.post('/check', checkWarranty);

module.exports = router;
