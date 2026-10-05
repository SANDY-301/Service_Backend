const Bill = require('../models/Bill');
const Warranty = require('../models/Warranty');
const Product = require('../models/Product');
const { processBillOCR } = require('../services/ocrService');
const { calculateWarrantyStatus } = require('../services/warrantyService');
const path = require('path');

// @desc    Upload purchase bill & trigger local Tesseract OCR
// @route   POST /api/bills/upload
// @access  Private
const uploadBill = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No bill file uploaded' });
    }

    const { companyId } = req.body;
    const relativeFilePath = `/uploads/bills/${req.file.filename}`;
    const absoluteFilePath = req.file.path;

    // Trigger local Tesseract OCR extraction
    const { rawOcrText, parsedOcrData } = await processBillOCR(absoluteFilePath);

    const bill = await Bill.create({
      userId: req.user._id,
      companyId: companyId || null,
      imagePath: relativeFilePath,
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype,
      rawOcrText: rawOcrText || '',
      parsedOcrData: parsedOcrData || {},
      verificationStatus: 'PENDING',
    });

    res.status(201).json({
      message: 'Bill uploaded and OCR extracted successfully',
      bill,
    });
  } catch (error) {
    console.error('Bill upload error:', error);
    res.status(500).json({ message: error.message || 'Error processing bill upload' });
  }
};

// @desc    Get user's uploaded bills
// @route   GET /api/bills/my-bills
// @access  Private
const getMyBills = async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user._id })
      .populate('companyId', 'companyName')
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bills (Admin view) with filter by verificationStatus
// @route   GET /api/bills
// @access  Private/Admin
const getAllBills = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.verificationStatus = status;

    const bills = await Bill.find(filter)
      .populate('userId', 'name email mobile')
      .populate('companyId', 'companyName')
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bill details by ID
// @route   GET /api/bills/:id
// @access  Private
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('userId', 'name email mobile')
      .populate('companyId');

    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // Also fetch associated warranty if any
    const warranty = await Warranty.findOne({ billId: bill._id });

    res.json({ bill, warranty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin verify or reject bill & edit OCR data
// @route   PUT /api/bills/:id/verify
// @access  Private/Admin
const verifyBill = async (req, res) => {
  try {
    const { verificationStatus, rejectionReason, parsedOcrData, productId } = req.body;
    const bill = await Bill.findById(req.params.id);

    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    if (parsedOcrData) {
      bill.parsedOcrData = { ...bill.parsedOcrData, ...parsedOcrData };
    }

    bill.verificationStatus = verificationStatus || bill.verificationStatus;
    bill.verifiedBy = req.user._id;
    bill.verifiedAt = new Date();
    if (rejectionReason) bill.rejectionReason = rejectionReason;

    await bill.save();

    let warrantyRecord = null;

    // If VERIFIED, perform warranty status calculation
    if (bill.verificationStatus === 'VERIFIED') {
      const purchaseDate = bill.parsedOcrData.purchaseDate || new Date();
      let warrantyMonths = 12;

      if (productId) {
        const prod = await Product.findById(productId);
        if (prod && prod.warrantyPeriodMonths) {
          warrantyMonths = prod.warrantyPeriodMonths;
        }
      }

      const warrantyCalc = calculateWarrantyStatus(purchaseDate, warrantyMonths);

      warrantyRecord = await Warranty.findOneAndUpdate(
        { billId: bill._id },
        {
          billId: bill._id,
          productId: productId || null,
          purchaseDate: warrantyCalc.purchaseDate || new Date(purchaseDate),
          warrantyMonths,
          warrantyEndDate: warrantyCalc.warrantyEndDate || new Date(),
          status: warrantyCalc.status,
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      message: `Bill status updated to ${bill.verificationStatus}`,
      bill,
      warranty: warrantyRecord,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadBill,
  getMyBills,
  getAllBills,
  getBillById,
  verifyBill,
};
