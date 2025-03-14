const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');
const { protect } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   GET /api/payments/get-key
// @desc    Get Razorpay key ID
// @access  Public
router.get('/get-key', (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID
  });
});

// @route   POST /api/payments/create-order
// @desc    Create a new Razorpay order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    console.log('=== PAYMENT DEBUG ===');
    console.log('Create order request received:', JSON.stringify(req.body));
    console.log('Amount received from client (raw):', req.body.amount);
    console.log('Amount type:', typeof req.body.amount);
    
    // Ensure amount is a number and convert to integer
    let amount;
    
    // Handle different input formats
    if (typeof req.body.amount === 'string') {
      // Remove any non-numeric characters (except decimal point)
      const cleanedAmount = req.body.amount.replace(/[^0-9.]/g, '');
      amount = parseInt(cleanedAmount, 10);
      console.log('Cleaned string amount:', cleanedAmount, '→', amount);
    } else if (typeof req.body.amount === 'number') {
      amount = Math.round(req.body.amount);
      console.log('Rounded number amount:', req.body.amount, '→', amount);
    } else {
      console.error('Invalid amount type:', typeof req.body.amount);
      return res.status(400).json({
        success: false,
        message: 'Invalid amount format'
      });
    }
    
    console.log('Final parsed amount:', amount);
    console.log('Is amount NaN?', isNaN(amount));
    
    if (isNaN(amount)) {
      console.error('Invalid amount format:', req.body.amount);
      return res.status(400).json({
        success: false,
        message: 'Invalid amount format'
      });
    }
    
    console.log('Amount in INR (paise):', amount);
    console.log('Amount in INR (rupees):', amount / 100);
    
    // Validate amount is at least 100 paise (₹1)
    if (amount < 100) {
      console.error('Amount too small:', amount);
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least ₹1'
      });
    }
    
    // Validate amount is reasonable (less than ₹1,000,000)
    if (amount > 100000000) {
      console.error('Amount too large:', amount);
      return res.status(400).json({
        success: false,
        message: 'Amount exceeds maximum allowed'
      });
    }
    
    console.log('User ID:', req.user._id);
    
    // Create Razorpay order with exact amount
    const options = {
      amount: amount,
      currency: 'INR', // Always use INR
      receipt: req.body.receipt || `order_${Date.now()}_${req.user._id}`
    };

    console.log('Creating Razorpay order with options:', JSON.stringify(options));
    
    try {
      const order = await razorpay.orders.create(options);
      console.log('Razorpay order created:', order);
      console.log('Razorpay order amount:', order.amount);

      res.json({
        success: true,
        order,
        amount: amount
      });
    } catch (razorpayError) {
      console.error('Razorpay error:', razorpayError);
      res.status(500).json({
        success: false,
        message: 'Error creating Razorpay order',
        error: razorpayError.message,
        stack: process.env.NODE_ENV === 'development' ? razorpayError.stack : undefined
      });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment and create order
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    console.log('Verify payment request received:', req.body);
    console.log('User ID:', req.user._id);
    
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !items) {
      console.error('Missing required parameters:', { 
        hasOrderId: !!razorpayOrderId, 
        hasPaymentId: !!razorpayPaymentId, 
        hasSignature: !!razorpaySignature, 
        hasItems: !!items 
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters for payment verification'
      });
    }

    console.log('Verifying payment signature...');
    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
    .digest('hex');

    console.log('Expected signature:', expectedSignature);
    console.log('Received signature:', razorpaySignature);
    
    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      console.error('Signature verification failed');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    console.log('Signature verified successfully');
    console.log('Processing items:', items);

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      console.log('Processing item:', item);
      
      const product = await Product.findById(item.product);
      
      if (!product) {
        console.error('Product not found:', item.product);
        return res.status(404).json({
          success: false,
          message: 'One or more products no longer exist'
        });
      }
      
      console.log('Found product:', product.name);
      
      // Get available key
      const key = product.getAvailableKey();
      
      if (!key) {
        console.error('No available keys for product:', product.name);
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock`
        });
      }
      
      console.log('Got available key for product:', key);
      
      // Calculate price with discount
      const discountedPrice = product.price - (product.price * (product.discount / 100));
      totalAmount += discountedPrice * item.quantity;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: discountedPrice,
        key: key.key
      });
      
      // Save product with updated keys - IMPORTANT: This marks the key as sold
      await product.save();
      console.log('Product saved with updated keys');
    }

    console.log('Creating order...');
    // Create order
    const order = new Order({
      user: req.user._id,
      products: orderItems,
      totalAmount,
      paymentInfo: {
        razorpayOrderId,
        razorpayPaymentId,
        signature: razorpaySignature
      },
      status: 'completed'
    });

    await order.save();
    console.log('Order created successfully:', order._id);

    // Add purchased keys to user
    const user = await User.findById(req.user._id);
    
    for (const item of orderItems) {
      // Find the product to get application and video links
      const product = await Product.findById(item.product);
      
      // Find the key in the product's availableKeys array
      // We need to find by the key string, not by isSold status
      const keyInfo = product.availableKeys.find(k => k.key === item.key);
      
      user.purchasedKeys.push({
        product: item.product,
        key: item.key,
        applicationLink: keyInfo ? keyInfo.applicationLink || product.applicationProcess : product.applicationProcess,
        videoTutorialLink: keyInfo ? keyInfo.videoTutorialLink || product.videoTutorial : product.videoTutorial,
        purchaseDate: Date.now()
      });
    }
    
    // Clear user's cart
    user.cart = [];
    await user.save();
    console.log('User updated with purchased keys and cart cleared');

    res.json({
      success: true,
      message: 'Payment verified and order created',
      order: {
        id: order._id,
        products: orderItems,
        totalAmount,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   POST /api/payments/add-keys
// @desc    Add purchased keys to user (for testing)
// @access  Private
router.post('/add-keys', protect, async (req, res) => {
  try {
    console.log('Add keys request received:', req.body);
    console.log('User ID:', req.user._id);
    
    const { orderId, items, productId } = req.body;
    
    // If items array is provided (from payment verification)
    if (items && Array.isArray(items)) {
      console.log('Processing multiple items:', items);
      
      const purchasedKeys = [];
      
      for (const item of items) {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          console.error('Product not found:', item.productId);
          return res.status(404).json({
            success: false,
            message: 'Product not found'
          });
        }
        
        console.log('Found product:', product.name);
        
        // Get available key
        const key = product.getAvailableKey();
        
        if (!key) {
          console.error('No available keys for product:', product.name);
          return res.status(400).json({
            success: false,
            message: 'No keys available for this product'
          });
        }
        
        console.log('Got available key for product:', key);
        
        // Save product with updated keys - IMPORTANT: This marks the key as sold
        await product.save();
        console.log('Product saved with updated keys');
        
        // Add key to user
        const user = await User.findById(req.user._id);
        
        user.purchasedKeys.push({
          product: product._id,
          key: key.key,
          applicationLink: key.applicationLink || product.applicationProcess,
          videoTutorialLink: key.videoTutorialLink || product.videoTutorial,
          purchaseDate: Date.now()
        });
        
        await user.save();
        
        purchasedKeys.push({
          product: product.name,
          key: key.key
        });
      }
      
      console.log('Keys added to user successfully');
      
      return res.json({
        success: true,
        message: 'Keys added to user',
        purchasedKeys
      });
    }
    
    // Single product case (for testing)
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Get available key
    const key = product.getAvailableKey();
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'No keys available for this product'
      });
    }
    
    console.log('Got available key for product:', key);
    
    // Save product with updated keys - IMPORTANT: This marks the key as sold
    await product.save();
    console.log('Product saved with updated keys');
    
    // Add key to user
    const user = await User.findById(req.user._id);
    
    user.purchasedKeys.push({
      product: product._id,
      key: key.key,
      applicationLink: key.applicationLink || product.applicationProcess,
      videoTutorialLink: key.videoTutorialLink || product.videoTutorial,
      purchaseDate: Date.now()
    });
    
    await user.save();

    res.json({
      success: true,
      message: 'Key added to user',
      key: key.key
    });
  } catch (error) {
    console.error('Error adding key:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding key',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   POST /api/payments/cart
// @desc    Add product to cart
// @access  Private
router.post('/cart', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if product has available keys
    if (!product.hasAvailableKeys()) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    // Check if product already in cart
    const cartItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );
    
    if (cartItemIndex > -1) {
      // Update quantity if product already in cart
      user.cart[cartItemIndex].quantity += Number(quantity);
    } else {
      // Add new product to cart
      user.cart.push({
        product: productId,
        quantity: Number(quantity)
      });
    }
    
    await user.save();

    // Populate cart for response
    const populatedUser = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price imageUrl discount'
    });
    
    res.json({
      success: true,
      message: 'Product added to cart',
      cart: populatedUser.cart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart',
      error: error.message
    });
  }
});

// @route   GET /api/payments/cart
// @desc    Get user's cart
// @access  Private
router.get('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price imageUrl discount'
    });
    
    res.json({
      success: true,
      cart: user.cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: error.message
    });
  }
});

// @route   DELETE /api/payments/cart/:productId
// @desc    Remove product from cart
// @access  Private
router.delete('/cart/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Filter out the product to remove
    user.cart = user.cart.filter(
      item => item.product.toString() !== req.params.productId
    );
    
    await user.save();

    // Populate cart for response
    const populatedUser = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price imageUrl discount'
    });
    
    res.json({
      success: true,
      message: 'Product removed from cart',
      cart: populatedUser.cart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from cart',
      error: error.message
    });
  }
});

module.exports = router; 