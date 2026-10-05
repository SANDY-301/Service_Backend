const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Company = require('./models/Company');
const ServiceCategory = require('./models/ServiceCategory');
const ServiceProblem = require('./models/ServiceProblem');
const Product = require('./models/Product');
const Provider = require('./models/Provider');
const ProviderService = require('./models/ProviderService');
const Bill = require('./models/Bill');
const Warranty = require('./models/Warranty');
const Slot = require('./models/Slot');
const Booking = require('./models/Booking');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homecare_service_hub';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await ServiceCategory.deleteMany({});
    await ServiceProblem.deleteMany({});
    await Product.deleteMany({});
    await Provider.deleteMany({});
    await ProviderService.deleteMany({});
    await Bill.deleteMany({});
    await Warranty.deleteMany({});
    await Slot.deleteMany({});
    await Booking.deleteMany({});

    console.log('Cleared existing collection data.');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'Sathya Store Admin',
      email: 'admin@sathya.in',
      mobile: '9876543210',
      password: 'admin123',
      role: 'ADMIN',
      address: '100 Mount Road, Guindy',
      city: 'Chennai',
      pincode: '600032',
    });

    const customerUser = await User.create({
      name: 'Ramesh Kumar',
      email: 'user@demo.com',
      mobile: '9123456789',
      password: 'user123',
      role: 'USER',
      address: '42 Anna Nagar 2nd Street',
      city: 'Chennai',
      pincode: '600040',
    });

    const providerUser = await User.create({
      name: 'Karthik Services',
      email: 'provider@demo.com',
      mobile: '9988776655',
      password: 'provider123',
      role: 'PROVIDER',
      address: '15 Main Road, T Nagar',
      city: 'Chennai',
      pincode: '600017',
    });

    console.log('Created Users (Admin, User, Provider).');

    // 2. Create Company
    const sathyaCompany = await Company.create({
      userId: adminUser._id,
      companyName: 'Sathya Agencies & Electronics',
      ownerName: 'Sathya Retail Pvt Ltd',
      mobile: '9876543210',
      email: 'support@sathya.in',
      address: '100 Mount Road, Guindy',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600032',
      gstNumber: '33AAAAA0000A1Z5',
      description: 'Authorized store for Samsung, LG, Whirlpool, Sony & leading home appliances.',
    });

    const vasanthCompany = await Company.create({
      companyName: 'Vasanth & Co Appliance Hub',
      ownerName: 'Vasanth Retail',
      mobile: '9888877777',
      email: 'service@vasanthandco.com',
      address: '50 Usman Road, T Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017',
      gstNumber: '33BBBBB1111B2Z6',
      description: 'Tamil Nadu\'s premier electronics showroom for authorized warranty service.',
    });

    console.log('Created Companies.');

    // 3. Create Service Categories
    const categoriesData = [
      { name: 'AC', icon: 'air-conditioner', description: 'Air Conditioners (Split, Window, Inverter)' },
      { name: 'Refrigerator', icon: 'fridge', description: 'Single, Double Door & Side-by-Side Fridges' },
      { name: 'TV', icon: 'tv', description: 'LED, OLED, QLED & Smart Televisions' },
      { name: 'Washing Machine', icon: 'washing-machine', description: 'Front Load, Top Load & Semi-Automatic' },
      { name: 'Microwave Oven', icon: 'microwave', description: 'Solo, Grill & Convection Microwave Ovens' },
      { name: 'Water Heater', icon: 'shower', description: 'Storage & Instant Geysers' },
      { name: 'Air Cooler', icon: 'fan', description: 'Desert & Personal Air Coolers' },
      { name: 'Mixer Grinder', icon: 'blender', description: 'Mixer Grinders, Juicers & Food Processors' },
      { name: 'Dishwasher', icon: 'dishwasher', description: 'Built-in & Freestanding Dishwashers' },
      { name: 'Other Electronics', icon: 'devices', description: 'Small Appliances & Gadgets' },
    ];

    const categoryDocs = await ServiceCategory.insertMany(categoriesData);
    const catMap = {};
    categoryDocs.forEach((cat) => {
      catMap[cat.name] = cat;
    });

    console.log('Created Service Categories.');

    // 4. Create Service Problems for Categories
    const problemsData = [
      // AC
      { categoryId: catMap['AC']._id, problemName: 'Not Cooling' },
      { categoryId: catMap['AC']._id, problemName: 'Low Cooling' },
      { categoryId: catMap['AC']._id, problemName: 'Water Leakage' },
      { categoryId: catMap['AC']._id, problemName: 'Gas Leakage / Refilling' },
      { categoryId: catMap['AC']._id, problemName: 'Excess Noise' },
      { categoryId: catMap['AC']._id, problemName: 'Power Not Turning On' },
      { categoryId: catMap['AC']._id, problemName: 'PCB Board Issue' },
      { categoryId: catMap['AC']._id, problemName: 'General Servicing' },

      // Refrigerator
      { categoryId: catMap['Refrigerator']._id, problemName: 'Not Cooling' },
      { categoryId: catMap['Refrigerator']._id, problemName: 'Excess Ice Formation' },
      { categoryId: catMap['Refrigerator']._id, problemName: 'Water Leakage' },
      { categoryId: catMap['Refrigerator']._id, problemName: 'Compressor Noise / Problem' },
      { categoryId: catMap['Refrigerator']._id, problemName: 'Door Seal / Gasket Issue' },

      // TV
      { categoryId: catMap['TV']._id, problemName: 'No Display / Black Screen' },
      { categoryId: catMap['TV']._id, problemName: 'No Sound / Audio Distortion' },
      { categoryId: catMap['TV']._id, problemName: 'Power Light Blinking / Won\'t Turn On' },
      { categoryId: catMap['TV']._id, problemName: 'Screen Panel Lines' },

      // Washing Machine
      { categoryId: catMap['Washing Machine']._id, problemName: 'Not Starting' },
      { categoryId: catMap['Washing Machine']._id, problemName: 'Water Not Draining' },
      { categoryId: catMap['Washing Machine']._id, problemName: 'Drum Not Rotating' },
      { categoryId: catMap['Washing Machine']._id, problemName: 'Excess Vibration / Noise' },
    ];

    const problemDocs = await ServiceProblem.insertMany(problemsData);
    const probMap = {};
    problemDocs.forEach((p) => {
      probMap[p.problemName] = p;
    });

    console.log('Created Service Problems.');

    // 5. Create Products under Companies
    const productsData = [
      {
        companyId: sathyaCompany._id,
        categoryId: catMap['AC']._id,
        brand: 'Samsung',
        productName: 'Samsung 1.5 Ton 5 Star Inverter Split AC',
        modelNumber: 'AR18CY5AMWK',
        warrantyPeriodMonths: 12,
        warrantyType: '1 Year Comprehensive + 10 Year Compressor Warranty',
        warrantyCoverage: 'Free company technician visit, gas check, PCB diagnosis & replacement of covered defect parts.',
        companyServiceCharge: 600,
        labourCharge: 350,
      },
      {
        companyId: sathyaCompany._id,
        categoryId: catMap['AC']._id,
        brand: 'LG',
        productName: 'LG Dual Inverter 1.5 Ton 3 Star Split AC',
        modelNumber: 'TS-Q18YNZA',
        warrantyPeriodMonths: 12,
        warrantyType: '1 Year Full Warranty',
        warrantyCoverage: 'Free parts & labour for all internal component defects.',
        companyServiceCharge: 550,
        labourCharge: 300,
      },
      {
        companyId: sathyaCompany._id,
        categoryId: catMap['Refrigerator']._id,
        brand: 'Whirlpool',
        productName: 'Whirlpool 265L 3 Star Frost Free Double Door Refrigerator',
        modelNumber: 'IF-INV-CNV-278',
        warrantyPeriodMonths: 12,
        warrantyType: '1 Year Comprehensive + 10 Year Compressor Warranty',
        warrantyCoverage: 'Covers compressor, thermostat, relay, and internal fan motor.',
        companyServiceCharge: 500,
        labourCharge: 250,
      },
      {
        companyId: sathyaCompany._id,
        categoryId: catMap['TV']._id,
        brand: 'Sony',
        productName: 'Sony Bravia 55 Inch 4K Ultra HD Smart LED TV',
        modelNumber: 'KD-55X74K',
        warrantyPeriodMonths: 24,
        warrantyType: '2 Year Comprehensive Manufacturer Warranty',
        warrantyCoverage: 'Full panel, motherboard, audio & power board coverage.',
        companyServiceCharge: 800,
        labourCharge: 400,
      },
      {
        companyId: sathyaCompany._id,
        categoryId: catMap['Washing Machine']._id,
        brand: 'IFB',
        productName: 'IFB 7 Kg 5 Star Fully Automatic Front Load Washing Machine',
        modelNumber: 'DIVA-AQUA-SX-7010',
        warrantyPeriodMonths: 48,
        warrantyType: '4 Year Super Warranty',
        warrantyCoverage: 'Covers drum, motor, inlet valve, control board, and pump.',
        companyServiceCharge: 500,
        labourCharge: 300,
      },
    ];

    const productDocs = await Product.insertMany(productsData);
    console.log('Created Company Products.');

    // 6. Create Local Service Provider
    const providerDoc = await Provider.create({
      userId: providerUser._id,
      name: 'Karthik Cool Air & Appliance Services',
      mobile: '9988776655',
      email: 'karthik.coolcare@gmail.com',
      address: '15 Main Road, T Nagar',
      city: 'Chennai',
      pincode: '600017',
      serviceArea: 'Chennai (T Nagar, Guindy, Anna Nagar, Velachery, Adyar)',
      experienceYears: 6,
      description: 'Expert local technician specializing in AC gas filling, compressor repair, fridge cooling, and washing machine services with transparent affordable pricing.',
    });

    // 7. Add Provider Services & Pricing
    const providerServicesData = [
      {
        providerId: providerDoc._id,
        categoryId: catMap['AC']._id,
        problemId: probMap['Not Cooling']._id,
        serviceCharge: 450,
        labourCharge: 200,
      },
      {
        providerId: providerDoc._id,
        categoryId: catMap['AC']._id,
        problemId: probMap['Water Leakage']._id,
        serviceCharge: 350,
        labourCharge: 150,
      },
      {
        providerId: providerDoc._id,
        categoryId: catMap['Refrigerator']._id,
        problemId: probMap['Not Cooling']._id,
        serviceCharge: 400,
        labourCharge: 150,
      },
      {
        providerId: providerDoc._id,
        categoryId: catMap['Washing Machine']._id,
        problemId: probMap['Not Starting']._id,
        serviceCharge: 350,
        labourCharge: 150,
      },
    ];

    await ProviderService.insertMany(providerServicesData);
    console.log('Created Provider Expertise & Pricing.');

    // 8. Create Default Slot for Company & Provider
    const todayStr = new Date().toISOString().split('T')[0];

    await Slot.create({
      targetId: sathyaCompany._id,
      targetType: 'COMPANY',
      date: todayStr,
      morningStart: '09:00 AM',
      morningEnd: '01:00 PM',
      morningMaxCapacity: 5,
      eveningStart: '02:00 PM',
      eveningEnd: '06:00 PM',
      eveningMaxCapacity: 5,
    });

    await Slot.create({
      targetId: providerDoc._id,
      targetType: 'PROVIDER',
      date: todayStr,
      morningStart: '09:00 AM',
      morningEnd: '01:00 PM',
      morningMaxCapacity: 5,
      eveningStart: '02:00 PM',
      eveningEnd: '06:00 PM',
      eveningMaxCapacity: 5,
    });

    console.log('Created Daily Booking Slots.');

    // 9. Sample Verified Bill & Active Warranty for Customer Demo
    const sampleBill = await Bill.create({
      userId: customerUser._id,
      companyId: sathyaCompany._id,
      imagePath: '/uploads/bills/sample_sathya_bill.jpg',
      originalFileName: 'sathya_purchase_receipt.jpg',
      mimeType: 'image/jpeg',
      rawOcrText: `SATHYA AGENCIES & ELECTRONICS
Invoice No: SAT-2026-9482
Date: 10/01/2026
Customer: Ramesh Kumar
Item: Samsung 1.5 Ton 5 Star Inverter Split AC
Model: AR18CY5AMWK
Serial No: SAM-AC-884920
Amount: Rs. 42,500.00
Warranty: 12 Months Official Company Warranty`,
      parsedOcrData: {
        invoiceNumber: 'SAT-2026-9482',
        purchaseDate: '2026-01-10',
        customerName: 'Ramesh Kumar',
        productName: 'Samsung 1.5 Ton 5 Star Inverter Split AC',
        brand: 'Samsung',
        modelNumber: 'AR18CY5AMWK',
        serialNumber: 'SAM-AC-884920',
        totalAmount: '42500',
      },
      verificationStatus: 'VERIFIED',
      verifiedBy: adminUser._id,
      verifiedAt: new Date(),
    });

    await Warranty.create({
      billId: sampleBill._id,
      productId: productDocs[0]._id,
      purchaseDate: new Date('2026-01-10'),
      warrantyMonths: 12,
      warrantyEndDate: new Date('2027-01-10'),
      status: 'ACTIVE',
    });

    console.log('Created Sample Verified Bill & Active Warranty.');

    console.log('\n=============================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('LOGIN CREDENTIALS:');
    console.log('1. Admin / Store:   admin@sathya.in  / admin123');
    console.log('2. Customer / User: user@demo.com    / user123');
    console.log('3. Local Provider:  provider@demo.com/ provider123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
