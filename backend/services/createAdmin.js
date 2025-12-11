require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Admin credentials (you can change these)
    const adminData = {
      name: 'Abul Kalam Azad',
      phone: '01816099735',  // Change this to your desired admin phone number
      password: 'azad123',  // Change this to your desired admin password
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ phone: adminData.phone });
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('Admin user already exists with phone:', adminData.phone);
        console.log('To update admin, delete the existing admin user first.');
        process.exit(0);
      } else {
        // Update existing user to admin
        existingAdmin.role = 'admin';
        existingAdmin.name = adminData.name;
        existingAdmin.password = adminData.password; // Will be hashed by pre-save hook
        await existingAdmin.save();
        console.log('✅ Existing user updated to admin!');
        console.log('Admin Phone:', adminData.phone);
        console.log('Admin Password:', adminData.password);
        process.exit(0);
      }
    }

    // Create new admin user
    const admin = new User(adminData);
    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Admin Phone:', adminData.phone);
    console.log('Admin Password:', adminData.password);
    console.log('\n⚠️  IMPORTANT: Change the admin credentials in createAdmin.js for security!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
}

createAdmin();

