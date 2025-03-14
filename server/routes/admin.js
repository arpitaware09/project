const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');

// @route   GET /api/admin/products
// @desc    Get all products for admin
// @access  Private/Admin
router.get('/products', protect, admin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching products for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message
    });
  }
});

// @route   GET /api/admin/products/:id
// @desc    Get product by ID for admin
// @access  Private/Admin
router.get('/products/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message
    });
  }
});

// @route   POST /api/admin/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/products', protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      imageUrl,
      category,
      publisher,
      platform,
      featured,
      discount,
      applicationProcess,
      downloadLink,
      videoTutorial
    } = req.body;
    
    const product = new Product({
      name,
      description,
      price,
      imageUrl,
      category,
      publisher,
      platform,
      featured: featured || false,
      discount: discount || 0,
      applicationProcess: applicationProcess || '',
      downloadLink: downloadLink || '',
      videoTutorial: videoTutorial || ''
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/products/:id', protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      imageUrl,
      category,
      publisher,
      platform,
      featured,
      discount,
      applicationProcess,
      downloadLink,
      videoTutorial
    } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Update product fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (imageUrl) product.imageUrl = imageUrl;
    if (category) product.category = category;
    if (publisher) product.publisher = publisher;
    if (platform) product.platform = platform;
    if (featured !== undefined) product.featured = featured;
    if (discount !== undefined) product.discount = discount;
    if (applicationProcess !== undefined) product.applicationProcess = applicationProcess;
    if (downloadLink !== undefined) product.downloadLink = downloadLink;
    if (videoTutorial !== undefined) product.videoTutorial = videoTutorial;
    
    await product.save();
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/products/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await product.deleteOne();
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: error.message
    });
  }
});

// @route   POST /api/admin/products/:id/keys
// @desc    Add keys to a product
// @access  Private/Admin
router.post('/products/:id/keys', protect, admin, async (req, res) => {
  try {
    const { keys } = req.body;
    
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of keys'
      });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Add keys to product
    keys.forEach(keyData => {
      product.availableKeys.push({
        key: keyData.key,
        applicationLink: keyData.applicationLink || '',
        videoTutorialLink: keyData.videoTutorialLink || ''
      });
    });
    
    await product.save();
    
    res.json({
      success: true,
      message: `${keys.length} keys added to product successfully`,
      product
    });
  } catch (error) {
    console.error('Error adding keys to product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding keys',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/products/:id/keys/:keyId
// @desc    Delete a key from a product
// @access  Private/Admin
router.delete('/products/:id/keys/:keyId', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Find key index
    const keyIndex = product.availableKeys.findIndex(
      key => key._id.toString() === req.params.keyId
    );
    
    if (keyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Key not found'
      });
    }
    
    // Remove key
    product.availableKeys.splice(keyIndex, 1);
    await product.save();
    
    res.json({
      success: true,
      message: 'Key deleted successfully',
      product
    });
  } catch (error) {
    console.error('Error deleting key:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting key',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    // Get counts
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();
    
    // Get recent products
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get products with low key count
    const lowKeyProducts = await Product.find()
      .where('availableKeys')
      .elemMatch({ isSold: false })
      .sort({ 'availableKeys.length': 1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        counts: {
          products: productCount,
          users: userCount
        },
        recentProducts,
        recentUsers,
        lowKeyProducts
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: error.message
    });
  }
});

module.exports = router; 