const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    console.log('Saving new user:', { name, email });
    await user.save();
    console.log('User saved successfully with ID:', user._id);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user and get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'purchasedKeys.product',
        select: 'name imageUrl'
      })
      .populate({
        path: 'cart.product',
        select: 'name price imageUrl discount'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: error.message
    });
  }
});

// @route   GET /api/auth/verify-token
// @desc    Verify JWT token
// @access  Private
router.get('/verify-token', protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// @route   GET /api/auth/purchased-products
// @desc    Get user's purchased products
// @access  Private
router.get('/purchased-products', protect, async (req, res) => {
  try {
    console.log('Fetching purchased products for user:', req.user._id);
    
    const user = await User.findById(req.user._id)
      .select('purchasedKeys')
      .populate({
        path: 'purchasedKeys.product',
        select: 'name description price imageUrl downloadLink category applicationProcess videoTutorial'
      });

    if (!user) {
      console.log('User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User purchased keys:', user.purchasedKeys);

    // Format the response to match what the client expects
    const products = user.purchasedKeys.map(item => ({
      id: item._id,
      product: item.product,
      key: item.key,
      applicationLink: item.applicationLink,
      videoTutorialLink: item.videoTutorialLink,
      purchaseDate: item.purchaseDate
    }));

    console.log('Formatted products:', products);

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching purchased products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching purchased products',
      error: error.message
    });
  }
});

module.exports = router; 