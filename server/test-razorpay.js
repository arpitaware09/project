const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const Razorpay = require('razorpay');

console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);

try {
  // Initialize Razorpay
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  console.log('Razorpay instance created successfully');

  // Try to create a test order
  const createTestOrder = async () => {
    try {
      const options = {
        amount: 50000, // 500 INR in paise
        currency: 'INR',
        receipt: `test_${Date.now()}`
      };

      const order = await razorpay.orders.create(options);
      console.log('Test order created successfully:', order);
    } catch (error) {
      console.error('Error creating test order:', error);
    }
  };

  createTestOrder();
} catch (error) {
  console.error('Error initializing Razorpay:', error);
} 