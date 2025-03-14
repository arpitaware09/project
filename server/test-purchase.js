require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    testPurchase();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function testPurchase() {
  try {
    // Find a test user or create one
    let testUser = await User.findOne({ email: 'testbuyer@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = new User({
        name: 'Test Buyer',
        email: 'testbuyer@example.com',
        password: 'password123'
      });
      await testUser.save();
      console.log('Test user created with ID:', testUser._id);
    } else {
      console.log('Using existing test user with ID:', testUser._id);
    }

    // Find the AimSlient exe product
    const product = await Product.findOne({ name: 'AimSlient exe' });
    if (!product) {
      console.error('Product not found');
      return;
    }
    console.log('Found product:', product.name, 'with ID:', product._id);

    // Check if product has available keys
    if (!product.hasAvailableKeys()) {
      console.error('No available keys for this product');
      return;
    }
    console.log('Product has available keys');

    // Simulate purchase
    console.log('Simulating purchase...');
    
    // Get an available key
    const key = product.getAvailableKey();
    if (!key) {
      console.error('Failed to get an available key');
      return;
    }
    console.log('Got key:', key);

    // Add the key to user's purchased keys
    testUser.purchasedKeys.push({
      product: product._id,
      key: key
    });
    await testUser.save();
    console.log('Added key to user\'s purchased keys');

    // Save the product with updated key status
    await product.save();
    console.log('Updated product key status');

    // Verify the purchase
    const updatedUser = await User.findById(testUser._id)
      .populate('purchasedKeys.product');
    
    console.log('User\'s purchased keys:');
    updatedUser.purchasedKeys.forEach(purchase => {
      console.log(`- ${purchase.product.name}: ${purchase.key}`);
    });

    // Check if the key is marked as sold
    const updatedProduct = await Product.findById(product._id);
    const keySold = updatedProduct.availableKeys.every(k => k.isSold);
    console.log('All keys sold:', keySold);

    console.log('Purchase test completed successfully!');
  } catch (error) {
    console.error('Error during purchase test:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
} 