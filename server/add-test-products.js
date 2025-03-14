require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    addTestProducts();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function addTestProducts() {
  try {
    // Delete existing test products to avoid duplicates
    await Product.deleteMany({ 
      name: { 
        $in: ['AimSlient exe', 'AimKill', 'Internal ESP', 'Bypass Emulator 32-bit,64-bit'] 
      } 
    });
    console.log('Deleted existing test products');

    // Create test products
    const testProducts = [
      {
        name: 'AimSlient exe',
        description: 'Advanced aim assistance software for gaming with silent execution.',
        price: 29.99,
        imageUrl: 'https://placehold.co/500x300?text=AimSlient+exe',
        category: 'software',
        publisher: 'AXIS Gaming',
        platform: 'windows',
        availableKeys: [
          { key: 'AXIS-sdjkh' }
        ],
        featured: true,
        discount: 10,
        applicationProcess: 'https://example.com/aimsilent/apply',
        downloadLink: 'https://example.com/aimsilent/download'
      },
      {
        name: 'AimKill',
        description: 'Premium aim enhancement tool with advanced targeting capabilities.',
        price: 39.99,
        imageUrl: 'https://placehold.co/500x300?text=AimKill',
        category: 'software',
        publisher: 'AXIS Gaming',
        platform: 'windows',
        availableKeys: [
          { key: 'AIMK-5678-EFGH-9012' }
        ],
        featured: false,
        discount: 0,
        applicationProcess: 'https://example.com/aimkill/apply',
        downloadLink: 'https://example.com/aimkill/download'
      },
      {
        name: 'Internal ESP',
        description: 'Enhanced spatial perception software for gaming with internal integration.',
        price: 49.99,
        imageUrl: 'https://placehold.co/500x300?text=Internal+ESP',
        category: 'software',
        publisher: 'AXIS Gaming',
        platform: 'windows',
        availableKeys: [
          { key: 'AXIS-sdjkh' }
        ],
        featured: true,
        discount: 15,
        applicationProcess: 'https://example.com/internalesp/apply',
        downloadLink: 'https://example.com/internalesp/download'
      },
      {
        name: 'Bypass Emulator 32-bit,64-bit',
        description: 'Advanced emulator bypass tool supporting both 32-bit and 64-bit systems.',
        price: 59.99,
        imageUrl: 'https://placehold.co/500x300?text=Bypass+Emulator',
        category: 'software',
        publisher: 'AXIS Gaming',
        platform: 'cross-platform',
        availableKeys: [
          { key: 'AXIS-sdjkh' }
        ],
        featured: true,
        discount: 20,
        applicationProcess: 'https://example.com/bypassemulator/apply',
        downloadLink: 'https://example.com/bypassemulator/download'
      }
    ];

    // Insert test products
    const result = await Product.insertMany(testProducts);
    console.log(`Added ${result.length} test products:`);
    result.forEach(product => {
      console.log(`- ${product.name} (ID: ${product._id})`);
    });

  } catch (error) {
    console.error('Error adding test products:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
} 