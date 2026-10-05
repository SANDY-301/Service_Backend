/**
 * clearDummyData.js
 * Clears all seeded/dummy data from MongoDB but preserves:
 *  - ServiceCategory (AC, Fridge, TV, etc.)
 *  - ServiceProblem (Not Cooling, Water Leakage, etc.)
 * These are needed for the app to function correctly.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Company = require('./models/Company');
const Product = require('./models/Product');
const Provider = require('./models/Provider');
const ProviderService = require('./models/ProviderService');
const Bill = require('./models/Bill');
const Warranty = require('./models/Warranty');
const Slot = require('./models/Slot');
const Booking = require('./models/Booking');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homecare_service_hub';

const clearDummyData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    // Delete all dummy/seeded records (NOT categories or problems)
    const [u, co, pr, prov, ps, b, w, s, bk] = await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Product.deleteMany({}),
      Provider.deleteMany({}),
      ProviderService.deleteMany({}),
      Bill.deleteMany({}),
      Warranty.deleteMany({}),
      Slot.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    console.log('✅ Cleared successfully:');
    console.log(`   Users deleted        : ${u.deletedCount}`);
    console.log(`   Companies deleted    : ${co.deletedCount}`);
    console.log(`   Products deleted     : ${pr.deletedCount}`);
    console.log(`   Providers deleted    : ${prov.deletedCount}`);
    console.log(`   Provider Services    : ${ps.deletedCount}`);
    console.log(`   Bills deleted        : ${b.deletedCount}`);
    console.log(`   Warranties deleted   : ${w.deletedCount}`);
    console.log(`   Slots deleted        : ${s.deletedCount}`);
    console.log(`   Bookings deleted     : ${bk.deletedCount}`);
    console.log('');
    console.log('✅ Service Categories & Problems preserved (not touched).');
    console.log('✅ Database is now clean. Only real registered data will appear.');

  } catch (err) {
    console.error('Error clearing data:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

clearDummyData();
