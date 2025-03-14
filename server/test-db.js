require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    testDatabase();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function testDatabase() {
  try {
    // Count users
    const userCount = await User.countDocuments();
    console.log(`Number of users in database: ${userCount}`);

    // Create a test user
    const testUser = new User({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });

    // Save the user
    await testUser.save();
    console.log('Test user created successfully:', testUser);

    // Find the user
    const foundUser = await User.findById(testUser._id);
    console.log('Found user:', foundUser);

    // Delete the test user
    await User.findByIdAndDelete(testUser._id);
    console.log('Test user deleted successfully');

    console.log('All database tests passed!');
  } catch (error) {
    console.error('Database test error:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
} 