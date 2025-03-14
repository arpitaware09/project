# Digital Keys Marketplace

A full-stack e-commerce application for selling digital product keys and software licenses. Built with the MERN stack (MongoDB, Express, React, Node.js) and integrated with Razorpay for payment processing.

## Features

- User authentication (register, login, profile)
- Product browsing and filtering
- Shopping cart functionality
- Secure checkout with Razorpay
- Digital key delivery after purchase
- Responsive design for all devices

## Tech Stack

### Frontend
- React
- React Router
- Styled Components
- Axios
- React Icons

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Razorpay API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Razorpay account for payment processing

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd digital-keys-marketplace
   ```

2. Install dependencies for the root, server, and client:
   ```
   npm run install-all
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret_key
   ```

4. Start the development server:
   ```
   npm start
   ```

This will run both the client (on port 3000) and server (on port 5000) concurrently.

## Project Structure

```
digital-keys-marketplace/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # React source files
│       ├── components/     # Reusable components
│       ├── context/        # Context providers
│       ├── pages/          # Page components
│       └── utils/          # Utility functions
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   └── routes/             # API routes
└── README.md               # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/verify-token` - Verify JWT token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Payments
- `GET /api/payments/get-key` - Get Razorpay key
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/add-keys` - Add purchased keys to user
- `POST /api/payments/cart` - Add to cart
- `GET /api/payments/cart` - Get cart
- `DELETE /api/payments/cart/:productId` - Remove from cart

## License

This project is licensed under the ISC License. 