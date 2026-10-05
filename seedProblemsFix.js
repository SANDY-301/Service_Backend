const mongoose = require('mongoose');
const ServiceCategory = require('./models/ServiceCategory');
const ServiceProblem = require('./models/ServiceProblem');
require('dotenv').config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homecare_service_hub');
    
    let cat = await ServiceCategory.findOne({ name: 'Washing Machine' });
    if (!cat) {
      cat = await ServiceCategory.create({ name: 'Washing Machine', description: 'Test', icon: 'test' });
    }

    const problems = [
      { categoryId: cat._id, problemName: 'Not Spinning', description: 'Drum is not spinning' },
      { categoryId: cat._id, problemName: 'Water Leaking', description: 'Water is leaking from the bottom' },
      { categoryId: cat._id, problemName: 'Making Loud Noise', description: 'Machine makes loud noise during cycle' }
    ];

    for (const prob of problems) {
      const exists = await ServiceProblem.findOne({ problemName: prob.problemName, categoryId: cat._id });
      if (!exists) {
        await ServiceProblem.create(prob);
      }
    }

    console.log('Problems seeded successfully!');
    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
};
test();
