const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Admin user details - you can modify these as needed
const adminUser = {
  name: 'Admin User',
  email: 'admin@gmail.com',
  password: 'Erawatipra09@',  // This will be hashed before saving
  role: 'admin'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists with this email.');
      console.log('Updating user to have admin role...');
      
      // Update the user to have admin role if they don't already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('User updated to admin role successfully!');
      } else {
        console.log('User already has admin role.');
      }
      
      console.log('Admin credentials:');
      console.log(`Email: ${adminUser.email}`);
      console.log('Password: [Use the existing password for this account]');
    } else {
      // Create a new admin user
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      const newAdmin = new User({
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        role: 'admin'
      });
      
      await newAdmin.save();
      
      console.log('Admin user created successfully!');
      console.log('Admin credentials:');
      console.log(`Email: ${adminUser.email}`);
      console.log(`Password: ${adminUser.password}`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Run the function
createAdminUser(); 