const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/products
// @desc    Get all products with optional filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      platform, 
      search, 
      minPrice, 
      maxPrice, 
      sort,
      featured,
      limit = 10,
      page = 1
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (platform) filter.platform = platform;
    if (featured === 'true') filter.featured = true;
    
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }
    
    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'price-asc':
          sortOption = { price: 1 };
          break;
        case 'price-desc':
          sortOption = { price: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'rating':
          sortOption = { rating: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const limitNum = Number(limit);

    // Execute query
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: Number(page),
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
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
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      imageUrl,
      category,
      publisher,
      platform,
      availableKeys,
      featured,
      discount
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      imageUrl,
      category,
      publisher,
      platform,
      availableKeys: availableKeys.map(key => ({ key })),
      featured: featured || false,
      discount: discount || 0
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      product: savedProduct
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

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      imageUrl,
      category,
      publisher,
      platform,
      availableKeys,
      featured,
      discount
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (imageUrl) product.imageUrl = imageUrl;
    if (category) product.category = category;
    if (publisher) product.publisher = publisher;
    if (platform) product.platform = platform;
    if (featured !== undefined) product.featured = featured;
    if (discount !== undefined) product.discount = discount;

    // Handle keys update if provided
    if (availableKeys && availableKeys.length > 0) {
      // Keep existing sold keys
      const soldKeys = product.availableKeys.filter(key => key.isSold);
      
      // Add new keys
      const newKeys = availableKeys.map(key => ({ key, isSold: false }));
      
      product.availableKeys = [...soldKeys, ...newKeys];
    }

    const updatedProduct = await product.save();

    res.json({
      success: true,
      product: updatedProduct
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

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
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
      message: 'Product removed'
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

// @route   POST /api/products/:id/reviews
// @desc    Add a review to a product
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    console.log('Review submission received:', { rating, comment, userId: req.user._id });
    
    const product = await Product.findById(req.params.id);
    console.log('Product found:', product ? product._id : 'Not found');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if user has purchased this product
    const user = await User.findById(req.user._id);
    const hasPurchased = user.purchasedKeys.some(
      purchase => purchase.product.toString() === product._id.toString()
    );
    
    console.log('User has purchased product:', hasPurchased);
    
    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: 'Only verified customers can review this product'
      });
    }
    
    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      review => review.user && review.user.toString() === req.user._id.toString()
    );
    
    console.log('Already reviewed:', alreadyReviewed ? 'Yes' : 'No');
    
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Product already reviewed'
      });
    }
    
    // Add review
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment
    };
    
    console.log('Adding review:', review);
    product.reviews.push(review);
    
    // Update product rating
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    console.log('Updated product rating:', product.rating);
    
    await product.save();
    console.log('Product saved with new review');
    
    res.status(201).json({
      success: true,
      message: 'Review added'
    });
  } catch (error) {
    console.error('Error adding review - full error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review',
      error: error.message
    });
  }
});

module.exports = router; 