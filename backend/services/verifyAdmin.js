require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function verifyAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB\n');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('❌ No admin user found in database!');
      console.log('Run: node services/createAdmin.js to create an admin user.');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('Name:', admin.name);
    console.log('Phone:', admin.phone);
    console.log('Role:', admin.role);
    console.log('Created:', admin.createdAt);
    console.log('\n📝 Use these credentials to login:');
    console.log('Phone:', admin.phone);
    console.log('Password: (the password you set in createAdmin.js)');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyAdmin();

