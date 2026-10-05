/**
 * Calculates warranty status and days remaining based on purchase date and warranty duration.
 * @param {Date|string} purchaseDateInput
 * @param {number} warrantyMonths
 * @param {Date} [currentDate=new Date()]
 */
const calculateWarrantyStatus = (purchaseDateInput, warrantyMonths = 12, currentDate = new Date()) => {
  const purchaseDate = new Date(purchaseDateInput);
  if (isNaN(purchaseDate.getTime())) {
    return {
      status: 'EXPIRED',
      isValidDate: false,
      purchaseDate: null,
      warrantyEndDate: null,
      daysRemaining: 0,
    };
  }

  const warrantyEndDate = new Date(purchaseDate);
  warrantyEndDate.setMonth(warrantyEndDate.getMonth() + Number(warrantyMonths));

  const isCurrentBeforeEnd = currentDate.getTime() <= warrantyEndDate.getTime();
  const status = isCurrentBeforeEnd ? 'ACTIVE' : 'EXPIRED';

  const diffTime = warrantyEndDate.getTime() - currentDate.getTime();
  const daysRemaining = isCurrentBeforeEnd ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;

  return {
    status,
    isValidDate: true,
    purchaseDate,
    warrantyEndDate,
    daysRemaining,
    warrantyMonths,
  };
};

/**
 * Calculates transparent pricing breakdown for company service under warranty or out-of-warranty.
 * Formula: Math.max(0, baseServiceCharge - warrantyDiscount) + labourCharge
 */
const calculateCompanyServicePricing = (companyServiceCharge = 0, labourCharge = 0, isWarrantyActive = false) => {
  const baseServiceCharge = Number(companyServiceCharge);
  const labour = Number(labourCharge);

  if (isWarrantyActive) {
    const warrantyDiscount = baseServiceCharge; // Full coverage for company service charge under warranty
    const remainingServiceCharge = Math.max(0, baseServiceCharge - warrantyDiscount);
    const finalAmount = Math.max(0, remainingServiceCharge + labour);

    return {
      baseServiceCharge,
      warrantyDiscount,
      remainingServiceCharge,
      labourCharge: labour,
      finalAmount,
    };
  } else {
    const warrantyDiscount = 0;
    const remainingServiceCharge = baseServiceCharge;
    const finalAmount = Math.max(0, baseServiceCharge + labour);

    return {
      baseServiceCharge,
      warrantyDiscount,
      remainingServiceCharge,
      labourCharge: labour,
      finalAmount,
    };
  }
};

/**
 * Calculates transparent pricing breakdown for local service provider.
 */
const calculateLocalServicePricing = (providerServiceCharge = 0, providerLabourCharge = 0) => {
  const baseServiceCharge = Number(providerServiceCharge);
  const labourCharge = Number(providerLabourCharge);
  const finalAmount = Math.max(0, baseServiceCharge + labourCharge);

  return {
    baseServiceCharge,
    warrantyDiscount: 0,
    remainingServiceCharge: baseServiceCharge,
    labourCharge,
    finalAmount,
  };
};

module.exports = {
  calculateWarrantyStatus,
  calculateCompanyServicePricing,
  calculateLocalServicePricing,
};
