const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// New admin user details
const adminUser = {
  name: 'Admin User',
  email: 'admin123@gmail.com',  // Different email
  password: 'Admin123!',  // Simpler password for testing
  role: 'admin'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createNewAdmin() {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: adminUser.email });
    
    if (existingUser) {
      console.log(`User already exists with email: ${adminUser.email}`);
      console.log('Deleting existing user to create a fresh one...');
      
      await User.deleteOne({ email: adminUser.email });
      console.log('Existing user deleted.');
    }
    
    // Create a new user document
    const newAdmin = new User({
      name: adminUser.name,
      email: adminUser.email,
      password: adminUser.password,  // Will be hashed by pre-save middleware
      role: adminUser.role
    });
    
    // Save the user
    await newAdmin.save();
    
    console.log('New admin user created successfully!');
    console.log('Admin credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);
    
    // Verify the password works
    const savedUser = await User.findOne({ email: adminUser.email });
    const isMatch = await savedUser.comparePassword(adminUser.password);
    console.log(`Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    
  } catch (error) {
    console.error('Error creating new admin user:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Run the function
createNewAdmin(); 