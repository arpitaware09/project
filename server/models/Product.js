const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['esp-keys', 'games', 'software', 'operating-systems']
  },
  publisher: {
    type: String,
    required: [true, 'Publisher is required']
  },
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    enum: ['windows', 'mac', 'linux', 'android', 'ios', 'cross-platform']
  },
  availableKeys: [{
    key: {
      type: String,
      required: true
    },
    isSold: {
      type: Boolean,
      default: false
    },
    applicationLink: {
      type: String,
      default: ''
    },
    videoTutorialLink: {
      type: String,
      default: ''
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  applicationProcess: {
    type: String,
    default: ''
  },
  downloadLink: {
    type: String,
    default: ''
  },
  videoTutorial: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for discounted price
ProductSchema.virtual('discountedPrice').get(function() {
  return this.price - (this.price * (this.discount / 100));
});

// Method to check if product has available keys
ProductSchema.methods.hasAvailableKeys = function() {
  return this.availableKeys.some(key => !key.isSold);
};

// Method to get an available key
ProductSchema.methods.getAvailableKey = function() {
  const availableKey = this.availableKeys.find(key => !key.isSold);
  if (availableKey) {
    availableKey.isSold = true;
    return {
      key: availableKey.key,
      applicationLink: availableKey.applicationLink || this.applicationProcess,
      videoTutorialLink: availableKey.videoTutorialLink || this.videoTutorial
    };
  }
  return null;
};

// Set toJSON option to include virtuals
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema); 