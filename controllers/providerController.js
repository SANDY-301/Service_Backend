const Provider = require('../models/Provider');
const ProviderService = require('../models/ProviderService');

// @desc    Get filtered local service providers based on category, problem, city/area
// @route   GET /api/providers
// @access  Public
const getProviders = async (req, res) => {
  try {
    const { categoryId, serviceProblemId, city, pincode, serviceArea } = req.query;

    let providerFilter = { isActive: true };

    if (city) {
      providerFilter.city = { $regex: city, $options: 'i' };
    }

    if (serviceArea) {
      providerFilter.$or = [
        { serviceArea: { $regex: serviceArea, $options: 'i' } },
        { city: { $regex: serviceArea, $options: 'i' } },
      ];
    }

    if (pincode) {
      providerFilter.pincode = pincode;
    }

    // Filter by category AND problem if provided
    if (categoryId || serviceProblemId) {
      let serviceFilter = { isActive: true };
      if (categoryId) serviceFilter.categoryId = categoryId;
      if (serviceProblemId) serviceFilter.problemId = serviceProblemId;

      const matchingServices = await ProviderService.find(serviceFilter);
      const matchingProviderIds = matchingServices.map((ps) => ps.providerId);

      if (matchingProviderIds.length > 0) {
        providerFilter._id = { $in: matchingProviderIds };
      }
    }

    const providers = await Provider.find(providerFilter);

    // Attach matching service charges for each provider
    const result = await Promise.all(
      providers.map(async (provider) => {
        let psFilter = { providerId: provider._id, isActive: true };
        if (categoryId) psFilter.categoryId = categoryId;
        if (serviceProblemId) psFilter.problemId = serviceProblemId;

        const services = await ProviderService.find(psFilter)
          .populate('categoryId', 'name')
          .populate('problemId', 'problemName');

        return {
          ...provider.toObject(),
          offeredServices: services,
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get provider profile & services by ID
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    const services = await ProviderService.find({ providerId: provider._id, isActive: true })
      .populate('categoryId', 'name')
      .populate('problemId', 'problemName');

    res.json({
      ...provider.toObject(),
      offeredServices: services,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add or Update Provider Service & Pricing
// @route   POST /api/providers/:id/services
// @access  Private/Provider
const updateProviderServicePricing = async (req, res) => {
  try {
    const { categoryId, problemId, serviceCharge, labourCharge } = req.body;
    let providerId = req.params.id;

    // Check if the id passed is actually a userId
    const providerByUserId = await Provider.findOne({ userId: providerId });
    if (providerByUserId) {
      providerId = providerByUserId._id;
    }

    let ps = await ProviderService.findOne({ providerId, categoryId, problemId });
    if (ps) {
      ps.serviceCharge = serviceCharge;
      ps.labourCharge = labourCharge;
      ps.isActive = true;
      await ps.save();
    } else {
      ps = await ProviderService.create({
        providerId,
        categoryId,
        problemId,
        serviceCharge,
        labourCharge,
      });
    }

    res.status(201).json(ps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProviders,
  getProviderById,
  updateProviderServicePricing,
};
