const mongoose = require('mongoose');
const ServiceCategory = require('./models/ServiceCategory');
require('dotenv').config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homecare_service_hub');
    const cat = await ServiceCategory.create({ name: 'Washing Machine', description: 'Test', icon: 'test' });
    console.log('Category created:', cat);
    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
};
test();
