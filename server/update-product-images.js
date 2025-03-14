const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import models
const Product = require('./models/Product');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital-marketplace';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const updateProductImages = async () => {
  try {
    // Get all products
    const products = await Product.find();
    console.log(`Found ${products.length} products to update`);

    // Update each product's image URL
    for (const product of products) {
      const oldUrl = product.imageUrl;
      
      // Skip if not using placeholder.com
      if (!oldUrl.includes('via.placeholder.com')) {
        console.log(`Skipping ${product.name} - not using placeholder.com`);
        continue;
      }
      
      // Replace via.placeholder.com with placehold.co
      const newUrl = oldUrl.replace('via.placeholder.com', 'placehold.co');
      product.imageUrl = newUrl;
      
      // Save the updated product
      await product.save();
      console.log(`Updated ${product.name} image URL from ${oldUrl} to ${newUrl}`);
    }

    console.log('All product images updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating product images:', error);
    process.exit(1);
  }
};

// Run the update function
updateProductImages(); 