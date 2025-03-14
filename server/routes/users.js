// @route   GET /api/users/has-purchased/:productId
// @desc    Check if user has purchased a specific product
// @access  Private
router.get('/has-purchased/:productId', protect, async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log('Checking purchase status for:', {
      userId: req.user._id,
      productId
    });
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('User found, checking purchasedKeys:', {
      purchasedKeysCount: user.purchasedKeys.length,
      purchasedKeys: user.purchasedKeys.map(p => ({
        productId: p.product.toString(),
        purchaseDate: p.purchaseDate
      }))
    });
    
    const hasPurchased = user.purchasedKeys.some(
      purchase => purchase.product.toString() === productId
    );
    
    console.log('Purchase status:', hasPurchased);
    
    res.json({
      success: true,
      hasPurchased
    });
  } catch (error) {
    console.error('Error checking purchase status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking purchase status',
      error: error.message
    });
  }
}); 