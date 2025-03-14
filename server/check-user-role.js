const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function checkUserRole(email) {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return;
    }
    
    console.log('User details:');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Admin access: ${user.role === 'admin' ? 'Yes' : 'No'}`);
    console.log(`Account created: ${new Date(user.createdAt).toLocaleString()}`);
    
  } catch (error) {
    console.error('Error checking user role:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Get email from command line arguments or use default
const email = process.argv[2] || 'admin@gmail.com';
console.log(`Checking role for user: ${email}`);

// Run the function
checkUserRole(email); 