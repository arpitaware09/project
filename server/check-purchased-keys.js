const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function checkPurchasedKeys() {
  try {
    // Get email from command line arguments or use default
    const email = process.argv[2] || 'admin123@gmail.com';
    console.log(`Checking purchased keys for user: ${email}`);
    
    // Find user by email
    const user = await User.findOne({ email }).populate('purchasedKeys.product');
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return;
    }
    
    console.log('User details:');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Number of purchased keys: ${user.purchasedKeys.length}`);
    
    if (user.purchasedKeys.length === 0) {
      console.log('User has no purchased keys.');
      return;
    }
    
    console.log('\nPurchased Keys:');
    for (const [index, keyInfo] of user.purchasedKeys.entries()) {
      console.log(`\n--- Key ${index + 1} ---`);
      console.log(`Product ID: ${keyInfo.product._id}`);
      console.log(`Product Name: ${keyInfo.product.name}`);
      console.log(`Key: ${keyInfo.key}`);
      console.log(`Application Link: ${keyInfo.applicationLink || 'Not provided'}`);
      console.log(`Video Tutorial Link: ${keyInfo.videoTutorialLink || 'Not provided'}`);
      console.log(`Purchase Date: ${new Date(keyInfo.purchaseDate).toLocaleString()}`);
      
      // Check if the product has application process and video tutorial
      console.log(`\nProduct Details:`);
      console.log(`Application Process: ${keyInfo.product.applicationProcess || 'Not provided'}`);
      console.log(`Video Tutorial: ${keyInfo.product.videoTutorial || 'Not provided'}`);
      
      // Find the key in the product's availableKeys array
      const product = await Product.findById(keyInfo.product._id);
      const productKey = product.availableKeys.find(k => k.key === keyInfo.key);
      
      if (productKey) {
        console.log(`\nKey Details in Product:`);
        console.log(`Key: ${productKey.key}`);
        console.log(`Is Sold: ${productKey.isSold}`);
        console.log(`Application Link: ${productKey.applicationLink || 'Not provided'}`);
        console.log(`Video Tutorial Link: ${productKey.videoTutorialLink || 'Not provided'}`);
      } else {
        console.log(`\nKey not found in product's availableKeys array.`);
      }
    }
    
  } catch (error) {
    console.error('Error checking purchased keys:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Run the function
checkPurchasedKeys(); 