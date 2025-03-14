require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    testBuyAll();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function testBuyAll() {
  try {
    // Find a test user or create one
    let testUser = await User.findOne({ email: 'testbuyer2@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = new User({
        name: 'Test Buyer 2',
        email: 'testbuyer2@example.com',
        password: 'password123'
      });
      await testUser.save();
      console.log('Test user created with ID:', testUser._id);
    } else {
      console.log('Using existing test user with ID:', testUser._id);
    }

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    // Buy one of each product
    for (const product of products) {
      console.log(`\nProcessing product: ${product.name}`);
      
      // Check if product has available keys
      if (!product.hasAvailableKeys()) {
        console.log(`No available keys for ${product.name}, skipping...`);
        continue;
      }
      
      // Get an available key
      const key = product.getAvailableKey();
      if (!key) {
        console.log(`Failed to get an available key for ${product.name}, skipping...`);
        continue;
      }
      console.log(`Got key for ${product.name}: ${key}`);
      
      // Add the key to user's purchased keys
      testUser.purchasedKeys.push({
        product: product._id,
        key: key
      });
      
      // Save the product with updated key status
      await product.save();
      console.log(`Updated key status for ${product.name}`);
    }
    
    // Save the user with all purchased keys
    await testUser.save();
    console.log('\nAdded all keys to user\'s purchased keys');

    // Verify the purchases
    const updatedUser = await User.findById(testUser._id)
      .populate('purchasedKeys.product');
    
    console.log('\nUser\'s purchased keys:');
    updatedUser.purchasedKeys.forEach(purchase => {
      console.log(`- ${purchase.product.name}: ${purchase.key}`);
    });

    console.log('\nAll purchase tests completed successfully!');
  } catch (error) {
    console.error('Error during purchase tests:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
} 