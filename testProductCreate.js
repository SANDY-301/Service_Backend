const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const ServiceCategory = require('./models/ServiceCategory');
require('dotenv').config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homecare_service_hub');
    const adminUser = await User.findOne({ role: 'ADMIN' });
    const category = await ServiceCategory.findOne();

    if (!adminUser || !category) {
      console.log('No admin user or category found. Please seed them first.');
      process.exit(1);
    }

    const payload = {
      companyId: adminUser._id, // Emulating the frontend fallback
      categoryId: category._id,
      brand: 'Test Brand',
      productName: 'Test Product',
      modelNumber: 'TEST-123',
      warrantyPeriodMonths: 12,
      warrantyType: 'Standard Comprehensive',
      companyServiceCharge: 500,
      labourCharge: 300,
    };

    const product = await Product.create(payload);
    console.log('Product created successfully!', product);
    process.exit(0);
  } catch (e) {
    console.error('Error creating product:', e);
    process.exit(1);
  }
};

test();
