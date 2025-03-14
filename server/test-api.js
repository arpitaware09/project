require('dotenv').config();
const axios = require('axios');

async function testRegistrationAPI() {
  try {
    console.log('Testing registration API...');
    
    // Generate a unique email
    const email = `test${Date.now()}@example.com`;
    
    // Create test user data
    const userData = {
      name: 'Test User',
      email,
      password: 'password123'
    };
    
    console.log('Sending registration request with data:', userData);
    
    // Send registration request
    const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration successful!');
    console.log('Response:', response.data);
    
    return true;
  } catch (error) {
    console.error('Registration failed!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    return false;
  }
}

// Run the test
testRegistrationAPI()
  .then(success => {
    console.log('Test completed with success:', success);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  }); 