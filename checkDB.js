const mongoose = require('mongoose');
const ServiceCategory = require('./models/ServiceCategory');
const User = require('./models/User');
const Company = require('./models/Company');
require('dotenv').config();

const test = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homecare_service_hub');
  const cats = await ServiceCategory.find();
  const users = await User.find();
  const comps = await Company.find();
  console.log('Categories:', cats.length);
  console.log('Users:', users.length);
  console.log('Companies:', comps.length);
  process.exit(0);
};

test();
