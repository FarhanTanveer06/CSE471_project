require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const sampleProducts = require('../utils/sampleProducts');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    console.log('Sample products seeded!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
