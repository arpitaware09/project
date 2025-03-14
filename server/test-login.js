const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Admin credentials to test
const adminCredentials = {
  email: 'admin@gmail.com',
  password: 'Erawatipra09@'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function testLogin() {
  try {
    console.log('Testing login with credentials:', adminCredentials);
    
    // Find user by email
    const user = await User.findOne({ email: adminCredentials.email });
    
    if (!user) {
      console.log('Error: User not found with email:', adminCredentials.email);
      return;
    }
    
    console.log('User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      passwordLength: user.password.length
    });
    
    // Test password comparison
    const isMatch = await user.comparePassword(adminCredentials.password);
    
    if (isMatch) {
      console.log('Password match: SUCCESS');
      console.log('Login would be successful');
    } else {
      console.log('Password match: FAILED');
      console.log('Login would fail with "Invalid credentials" error');
      
      // For debugging purposes, let's create a new hash of the password to see if it matches
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminCredentials.password, salt);
      console.log('New hash of the provided password:', hashedPassword);
      console.log('Stored password hash:', user.password);
    }
    
  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Run the function
testLogin(); 