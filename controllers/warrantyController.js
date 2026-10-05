const Warranty = require('../models/Warranty');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const { calculateWarrantyStatus, calculateCompanyServicePricing } = require('../services/warrantyService');

// @desc    Check warranty status & service pricing breakdown for a bill and product
// @route   POST /api/warranty/check
// @access  Public / Private
const checkWarranty = async (req, res) => {
  try {
    const { billId, productId } = req.body;

    let bill = null;
    if (billId) {
      bill = await Bill.findById(billId);
    }

    let product = null;
    if (productId) {
      product = await Product.findById(productId);
    }

    const purchaseDate = (bill && bill.parsedOcrData && bill.parsedOcrData.purchaseDate)
      ? bill.parsedOcrData.purchaseDate
      : new Date();

    const warrantyMonths = product ? product.warrantyPeriodMonths : 12;

    const warrantyCalc = calculateWarrantyStatus(purchaseDate, warrantyMonths);

    const isWarrantyActive = warrantyCalc.status === 'ACTIVE' && (bill ? bill.verificationStatus === 'VERIFIED' : true);

    const companyPricing = calculateCompanyServicePricing(
      product ? product.companyServiceCharge : 500,
      product ? product.labourCharge : 300,
      isWarrantyActive
    );

    res.json({
      billVerificationStatus: bill ? bill.verificationStatus : 'NOT_VERIFIED',
      warrantyStatus: warrantyCalc.status,
      purchaseDate: warrantyCalc.purchaseDate,
      warrantyEndDate: warrantyCalc.warrantyEndDate,
      daysRemaining: warrantyCalc.daysRemaining,
      warrantyPeriodMonths: warrantyMonths,
      isWarrantyActive,
      companyPricing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { checkWarranty };
