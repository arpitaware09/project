const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Admin credentials
const adminEmail = 'admin@gmail.com';
const newPassword = 'Erawatipra09@';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function resetAdminPassword() {
  try {
    // Find admin user
    const user = await User.findOne({ email: adminEmail });
    
    if (!user) {
      console.log(`No user found with email: ${adminEmail}`);
      return;
    }
    
    console.log('Found user:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user's password directly (bypassing the pre-save middleware)
    user.password = hashedPassword;
    await user.save();
    
    console.log('Password reset successfully!');
    console.log('New admin credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${newPassword}`);
    
    // Verify the password works
    const isMatch = await user.comparePassword(newPassword);
    console.log(`Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Run the function
resetAdminPassword(); 