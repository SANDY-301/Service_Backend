const mongoose = require('mongoose');
const Provider = require('./models/Provider');
const ProviderService = require('./models/ProviderService');
require('dotenv').config();

const inject = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homecare_service_hub');

    // Create a dummy provider
    let provider = await Provider.findOne({ email: 'localtech@test.com' });
    if (!provider) {
      provider = await Provider.create({
        name: 'Ramesh Repair Services',
        email: 'localtech@test.com',
        phone: '9988776655',
        role: 'PROVIDER',
        city: 'Chennai',
        pincode: '600001',
        serviceArea: 'Chennai Central',
        experienceYears: 5,
        isActive: true,
      });
    }

    // Assign this provider to ALL existing problems in the database
    const ServiceProblem = require('./models/ServiceProblem');
    const problems = await ServiceProblem.find({});

    for (let prob of problems) {
      const exists = await ProviderService.findOne({ providerId: provider._id, problemId: prob._id });
      if (!exists) {
        await ProviderService.create({
          providerId: provider._id,
          categoryId: prob.categoryId,
          problemId: prob._id,
          serviceCharge: 350,
          labourCharge: 400,
          isActive: true
        });
      }
    }

    console.log('Dummy local technician injected successfully!');
    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
};
inject();
