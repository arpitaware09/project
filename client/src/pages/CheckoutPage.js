import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaCreditCard, FaLock } from 'react-icons/fa';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const CheckoutPage = () => {
  const { cart, loading: cartLoading, error: cartError, clearCart, totalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const navigate = useNavigate();
  
  const [orderDetails, setOrderDetails] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [razorpayKey, setRazorpayKey] = useState('');
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Pre-fill user details if available
  useEffect(() => {
    if (user) {
      setOrderDetails(prevDetails => ({
        ...prevDetails,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);
  
  // Get Razorpay key
  useEffect(() => {
    const fetchRazorpayKey = async () => {
      try {
        const res = await api.get('/api/payments/get-key');
        if (res.data.success) {
          setRazorpayKey(res.data.key);
        }
      } catch (err) {
        console.error('Error fetching Razorpay key:', err);
        setError('Failed to initialize payment system');
      }
    };
    
    fetchRazorpayKey();
  }, []);
  
  // Log cart details for debugging
  useEffect(() => {
    if (cart && cart.length > 0) {
      console.log('Cart items:');
      cart.forEach(item => {
        console.log(`Product: ${item.product.name}`);
        console.log(`  Original price: $${item.product.price}`);
        console.log(`  Discount: ${item.product.discount}%`);
        const discountedPrice = item.product.discount > 0 
          ? item.product.price - (item.product.price * item.product.discount / 100)
          : item.product.price;
        console.log(`  Discounted price: $${discountedPrice}`);
        console.log(`  Quantity: ${item.quantity}`);
        console.log(`  Total item price: $${discountedPrice * item.quantity}`);
      });
    }
  }, [cart]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    const { name, email, address, city, state, zipCode, country } = orderDetails;
    
    if (!name || !email || !address || !city || !state || !zipCode || !country) {
      setError('Please fill in all fields');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  // Load Razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };
  
  // Handle payment
  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Current display currency:', currency);
      console.log('Total price in display currency:', totalPrice);
      
      // SIMPLIFIED APPROACH: All prices are now stored in INR
      // No need for currency conversion, just add tax
      
      // Add 18% tax to the INR price
      const amountWithTax = totalPrice * 1.18;
      console.log('Added 18% tax:', totalPrice, '* 1.18 =', amountWithTax);
      
      // Convert to paise (multiply by 100)
      const amountInPaise = Math.round(amountWithTax * 100);
      console.log('Converted to paise:', amountWithTax, '* 100 =', amountInPaise);
      
      // For debugging: Log the exact value being sent
      console.log('FINAL AMOUNT BEING SENT TO SERVER (in paise):', amountInPaise);
      
      // Create order with the calculated amount
      const orderRes = await api.post('/api/payments/create-order', {
        amount: amountInPaise.toString(), // Convert to string to avoid any type issues
        currency: 'INR',
        receipt: `order_${Date.now()}`
      });
      
      console.log('Order created successfully:', orderRes.data);
      console.log('Order amount from response:', orderRes.data.order.amount);
      
      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create order');
      }
      
      setOrderId(orderRes.data.order.id);
      
      // Load Razorpay
      console.log('Loading Razorpay SDK...');
      const res = await loadRazorpay();
      
      if (!res) {
        throw new Error('Razorpay SDK failed to load');
      }
      
      console.log('Razorpay SDK loaded successfully');
      console.log('Configuring Razorpay with key:', razorpayKey);
      console.log('Order ID:', orderRes.data.order.id);
      console.log('Amount:', orderRes.data.order.amount);
      
      // Configure Razorpay
      const options = {
        key: razorpayKey,
        amount: orderRes.data.order.amount,
        currency: orderRes.data.order.currency,
        name: 'Quick Axis',
        description: 'Purchase of digital products',
        order_id: orderRes.data.order.id,
        handler: async (response) => {
          try {
            console.log('Payment successful, verifying payment...');
            console.log('Payment response:', response);
            
            // Verify payment
            const verifyRes = await api.post('/api/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items: cart.map(item => ({
                product: item.product._id,
                quantity: item.quantity
              }))
            });
            
            console.log('Payment verification response:', verifyRes.data);
            
            if (verifyRes.data.success) {
              console.log('Payment verified successfully!');
              
              // Keys are already added to user during payment verification
              // No need to call add-keys again
              
              // Clear cart and redirect to success page
              clearCart();
              navigate('/profile');
            }
          } catch (err) {
            console.error('Error verifying payment:', err);
            let errorMessage = 'Payment verification failed';
            
            if (err.response) {
              errorMessage = `Server error (${err.response.status}): ${err.response.data?.message || err.message}`;
              console.error('Error response data:', err.response.data);
            }
            
            setError(errorMessage);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: orderDetails.name,
          email: orderDetails.email,
          contact: ''
        },
        theme: {
          color: '#3399cc'
        }
      };
      
      console.log('Opening Razorpay payment form...');
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (err) {
      console.error('Error processing payment:', err);
      let errorMessage = 'Payment processing failed';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server error (${err.response.status}): ${err.response.data?.message || err.message}`;
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
        console.error('Error request:', err.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  if (cartLoading) {
    return (
      <LoadingContainer>
        <div className="container">
          <LoadingMessage>Loading checkout...</LoadingMessage>
        </div>
      </LoadingContainer>
    );
  }
  
  if (cartError) {
    return (
      <ErrorContainer>
        <div className="container">
          <ErrorMessage>{cartError}</ErrorMessage>
          <BackButton onClick={goBack}>
            <FaArrowLeft /> Go Back
          </BackButton>
        </div>
      </ErrorContainer>
    );
  }
  
  if (!cart || cart.length === 0) {
    return (
      <EmptyCartContainer>
        <div className="container">
          <EmptyCartContent>
            <EmptyCartTitle>Your cart is empty</EmptyCartTitle>
            <EmptyCartMessage>
              You need to add products to your cart before checking out.
            </EmptyCartMessage>
            <BackButton as={Link} to="/products">
              <FaArrowLeft /> Browse Products
            </BackButton>
          </EmptyCartContent>
        </div>
      </EmptyCartContainer>
    );
  }
  
  return (
    <CheckoutContainer>
      <div className="container">
        <CheckoutHeader>
          <h1>Checkout</h1>
          {currency === 'USD' && (
            <CurrencyNote>
              <strong>Important:</strong> While prices are displayed in USD, payment will be processed in Indian Rupees (INR) at a conversion rate of 1 USD = 83.5 INR.
            </CurrencyNote>
          )}
          <CheckoutSteps>
            <CheckoutStep isActive={true}>Cart</CheckoutStep>
            <CheckoutStepDivider />
            <CheckoutStep isActive={true}>Checkout</CheckoutStep>
            <CheckoutStepDivider />
            <CheckoutStep isActive={false}>Confirmation</CheckoutStep>
          </CheckoutSteps>
        </CheckoutHeader>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <CheckoutContent>
          <CheckoutForm>
            <FormSection>
              <SectionTitle>Billing Information</SectionTitle>
              
              <FormGroup>
                <FormLabel htmlFor="name">Full Name</FormLabel>
                <FormInput
                  type="text"
                  id="name"
                  name="name"
                  value={orderDetails.name}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="email">Email Address</FormLabel>
                <FormInput
                  type="email"
                  id="email"
                  name="email"
                  value={orderDetails.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="address">Address</FormLabel>
                <FormInput
                  type="text"
                  id="address"
                  name="address"
                  value={orderDetails.address}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormRow>
                <FormGroup>
                  <FormLabel htmlFor="city">City</FormLabel>
                  <FormInput
                    type="text"
                    id="city"
                    name="city"
                    value={orderDetails.city}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="state">State/Province</FormLabel>
                  <FormInput
                    type="text"
                    id="state"
                    name="state"
                    value={orderDetails.state}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </FormRow>
              
              <FormRow>
                <FormGroup>
                  <FormLabel htmlFor="zipCode">ZIP/Postal Code</FormLabel>
                  <FormInput
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={orderDetails.zipCode}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="country">Country</FormLabel>
                  <FormSelect
                    id="country"
                    name="country"
                    value={orderDetails.country}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="China">China</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Other">Other</option>
                  </FormSelect>
                </FormGroup>
              </FormRow>
            </FormSection>
            
            <FormActions>
              <BackButton as="button" type="button" onClick={goBack}>
                <FaArrowLeft /> Back to Cart
              </BackButton>
              
              <PaymentButton
                type="button"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? 'Processing...' : (
                  <>
                    <FaCreditCard /> Pay Now <FaLock />
                  </>
                )}
              </PaymentButton>
            </FormActions>
          </CheckoutForm>
          
          <OrderSummary>
            <SectionTitle>Order Summary</SectionTitle>
            
            <OrderItems>
              {cart.map((item) => (
                <OrderItem key={item.product._id}>
                  <OrderItemImage src={item.product.imageUrl} alt={item.product.name} />
                  <OrderItemDetails>
                    <OrderItemName>{item.product.name}</OrderItemName>
                    <OrderItemMeta>
                      <OrderItemQuantity>Qty: {item.quantity}</OrderItemQuantity>
                      <OrderItemPrice>
                        {formatPrice(
                          item.product.discount > 0
                            ? (item.product.price - (item.product.price * item.product.discount / 100)) * item.quantity
                            : item.product.price * item.quantity
                        )}
                      </OrderItemPrice>
                    </OrderItemMeta>
                  </OrderItemDetails>
                </OrderItem>
              ))}
            </OrderItems>
            
            <OrderSummaryDivider />
            
            <OrderSummaryRow>
              <OrderSummaryLabel>Subtotal:</OrderSummaryLabel>
              <OrderSummaryValue>{formatPrice(totalPrice)}</OrderSummaryValue>
            </OrderSummaryRow>
            
            <OrderSummaryRow>
              <OrderSummaryLabel>Tax (18%):</OrderSummaryLabel>
              <OrderSummaryValue>{formatPrice(totalPrice * 0.18)}</OrderSummaryValue>
            </OrderSummaryRow>
            
            <OrderSummaryDivider />
            
            <OrderTotal>
              <OrderTotalLabel>Total:</OrderTotalLabel>
              <OrderTotalValue>{formatPrice(totalPrice * 1.18)}</OrderTotalValue>
            </OrderTotal>
            
            {currency === 'USD' && (
              <PaymentNote>
                <strong>Note:</strong> While prices are displayed in USD for your convenience, all payments are processed in Indian Rupees (INR). The actual amount charged will be ₹{Math.round(totalPrice * 1.18).toLocaleString('en-IN')} (including 18% tax).
              </PaymentNote>
            )}
            
            <SecurePaymentNote>
              <FaLock /> Secure Payment via Razorpay
            </SecurePaymentNote>
          </OrderSummary>
        </CheckoutContent>
      </div>
    </CheckoutContainer>
  );
};

const CheckoutContainer = styled.div`
  padding: 2rem 0 4rem;
`;

const CheckoutHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #ffffff;
  }
`;

const CheckoutSteps = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const CheckoutStep = styled.div`
  padding: 0.5rem 1rem;
  background-color: ${props => props.isActive ? 'var(--primary-color)' : '#333333'};
  color: ${props => props.isActive ? 'white' : '#b3b3b3'};
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
`;

const CheckoutStepDivider = styled.div`
  height: 1px;
  width: 50px;
  background-color: #333333;
  margin: 0 0.5rem;
  
  @media (max-width: 576px) {
    width: 20px;
  }
`;

const CheckoutContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const CheckoutForm = styled.div`
  background-color: #181818;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  padding: 2rem;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  position: relative;
  color: #ffffff;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 40px;
    height: 3px;
    background-color: var(--primary-color);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 0;
  }
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #b3b3b3;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #333333;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #222222;
  color: #ffffff;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #333333;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #222222;
  color: #ffffff;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: rgba(229, 9, 20, 0.1);
  }
  
  @media (max-width: 576px) {
    width: 100%;
    justify-content: center;
  }
`;

const PaymentButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  svg:first-child {
    margin-right: 0.5rem;
  }
  
  svg:last-child {
    margin-left: 0.5rem;
    font-size: 0.8rem;
  }
  
  &:hover:not(:disabled) {
    background-color: var(--secondary-color);
  }
  
  &:disabled {
    background-color: #444444;
    cursor: not-allowed;
  }
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const OrderSummary = styled.div`
  background-color: #181818;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  padding: 2rem;
  height: fit-content;
`;

const OrderItems = styled.div`
  margin-bottom: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
`;

const OrderItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333333;
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const OrderItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1rem;
`;

const OrderItemDetails = styled.div`
  flex: 1;
`;

const OrderItemName = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #ffffff;
`;

const OrderItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
`;

const OrderItemQuantity = styled.div`
  color: #b3b3b3;
`;

const OrderItemPrice = styled.div`
  font-weight: 600;
  color: #ffffff;
`;

const OrderSummaryDivider = styled.div`
  height: 1px;
  background-color: #333333;
  margin: 1rem 0;
`;

const OrderSummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const OrderSummaryLabel = styled.div`
  color: #b3b3b3;
`;

const OrderSummaryValue = styled.div`
  font-weight: 600;
  color: #ffffff;
`;

const OrderTotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
`;

const OrderTotalLabel = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: #ffffff;
`;

const OrderTotalValue = styled.div`
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--primary-color);
`;

const PaymentNote = styled.div`
  font-size: 0.85rem;
  color: #b3b3b3;
  margin-top: 1.5rem;
`;

const SecurePaymentNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #b3b3b3;
  margin-top: 1.5rem;
  
  svg {
    margin-right: 0.5rem;
    color: var(--success-color);
  }
`;

const ErrorAlert = styled.div`
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--danger-color);
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const LoadingContainer = styled.div`
  padding: 4rem 0;
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 1.1rem;
  color: #b3b3b3;
`;

const ErrorContainer = styled.div`
  padding: 4rem 0;
  text-align: center;
`;

const ErrorMessage = styled.div`
  font-size: 1.1rem;
  color: var(--danger-color);
  margin-bottom: 2rem;
`;

const EmptyCartContainer = styled.div`
  padding: 4rem 0;
`;

const EmptyCartContent = styled.div`
  text-align: center;
  background-color: #181818;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  padding: 3rem;
  max-width: 600px;
  margin: 0 auto;
`;

const EmptyCartTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #ffffff;
`;

const EmptyCartMessage = styled.p`
  color: #b3b3b3;
  margin-bottom: 2rem;
`;

const CurrencyNote = styled.div`
  font-size: 0.85rem;
  color: #b3b3b3;
  margin-top: 1rem;
`;

export default CheckoutPage; 