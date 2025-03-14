import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTrash, FaArrowLeft, FaShoppingCart, FaArrowRight, FaMinus, FaPlus } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const CartPage = () => {
  const { cart, loading, error, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setCheckoutLoading(true);
    try {
      navigate('/checkout');
    } catch (err) {
      console.error('Error during checkout:', err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <div className="container">
          <LoadingMessage>Loading your cart...</LoadingMessage>
        </div>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <div className="container">
          <ErrorMessage>{error}</ErrorMessage>
          <BackButton to="/products">
            <FaArrowLeft /> Continue Shopping
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
            <EmptyCartIcon>
              <FaShoppingCart />
            </EmptyCartIcon>
            <EmptyCartTitle>Your cart is empty</EmptyCartTitle>
            <EmptyCartMessage>
              Looks like you haven't added any products to your cart yet.
            </EmptyCartMessage>
            <BackButton to="/products">
              <FaArrowLeft /> Browse Products
            </BackButton>
          </EmptyCartContent>
        </div>
      </EmptyCartContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Your Cart</Title>
        <ItemCount>{totalItems} {totalItems === 1 ? 'item' : 'items'}</ItemCount>
      </Header>

      <Content>
        <CartItems>
          {cart.map((item) => (
            <CartItem key={item.product._id}>
              <ProductInfo>
                <ProductName>
                  <Link to={`/products/${item.product._id}`}>{item.product.name}</Link>
                </ProductName>
                <ProductPrice>{formatPrice(item.product.price)}</ProductPrice>
              </ProductInfo>
              <QuantityControls>
                <QuantityButton
                  onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                >
                  <FaMinus />
                </QuantityButton>
                <Quantity>{item.quantity}</Quantity>
                <QuantityButton
                  onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                >
                  <FaPlus />
                </QuantityButton>
              </QuantityControls>
              <RemoveButton onClick={() => handleRemoveItem(item.product._id)}>
                <FaTrash />
              </RemoveButton>
            </CartItem>
          ))}
        </CartItems>

        <CartSummary>
          <SummaryTitle>Order Summary</SummaryTitle>
          <SummaryRow>
            <span>Subtotal ({totalItems} items)</span>
            <span>{formatPrice(totalPrice)}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Tax (18%)</span>
            <span>{formatPrice(totalPrice * 0.18)}</span>
          </SummaryRow>
          <SummaryRow total>
            <span>Total</span>
            <span>{formatPrice(totalPrice * 1.18)}</span>
          </SummaryRow>
          <CheckoutButton
            onClick={handleCheckout}
            disabled={checkoutLoading || cart.length === 0}
          >
            {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
          </CheckoutButton>
        </CartSummary>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #ffffff;
  margin: 0;
`;

const ItemCount = styled.span`
  color: #b3b3b3;
  font-size: 1.1rem;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CartItems = styled.div`
  background: #181818;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  padding: 1rem;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #333333;

  &:last-child {
    border-bottom: none;
  }
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #ffffff;
  
  a {
    color: #ffffff;
    text-decoration: none;
    
    &:hover {
      color: var(--primary-color);
    }
  }
`;

const ProductPrice = styled.p`
  margin: 0.5rem 0 0;
  color: #b3b3b3;
  font-weight: 500;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 1rem;
`;

const QuantityButton = styled.button`
  background: #333333;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff;

  &:hover {
    background: #444444;
  }
`;

const Quantity = styled.span`
  min-width: 32px;
  text-align: center;
  font-weight: 500;
  color: #ffffff;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--secondary-color);
  }
`;

const CartSummary = styled.div`
  background: #181818;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  height: fit-content;
`;

const SummaryTitle = styled.h2`
  margin: 0 0 1rem;
  font-size: 1.5rem;
  color: #ffffff;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: ${props => props.total ? '#ffffff' : '#b3b3b3'};
  font-weight: ${props => props.total ? '600' : '400'};
  font-size: ${props => props.total ? '1.1rem' : '1rem'};
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background: var(--secondary-color);
  }

  &:disabled {
    background: #444444;
    cursor: not-allowed;
  }
`;

const EmptyCartContainer = styled.div`
  padding: 4rem 0;
`;

const EmptyCartContent = styled.div`
  text-align: center;
  background-color: #181818;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  padding: 3rem;
  max-width: 600px;
  margin: 0 auto;
`;

const EmptyCartIcon = styled.div`
  font-size: 4rem;
  color: #666666;
  margin-bottom: 1.5rem;
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

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.3s ease;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const LoadingContainer = styled.div`
  padding: 4rem 0;
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 1.1rem;
  color: #666;
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

export default CartPage; 