import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product._id);
  };
  
  // Calculate discounted price
  const discountedPrice = product.discount > 0 
    ? product.price - (product.price * (product.discount / 100)) 
    : null;
  
  return (
    <Card>
      <Link to={`/products/${product._id}`}>
        <ImageContainer>
          <CardImage src={product.imageUrl} alt={product.name} />
        </ImageContainer>
        
        {product.discount > 0 && (
          <DiscountBadge>-{product.discount}%</DiscountBadge>
        )}
        
        <CardBody>
          <CardCategory>{product.category}</CardCategory>
          <CardTitle>{product.name}</CardTitle>
          
          <CardRating>
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                color={i < Math.round(product.rating) ? '#f39c12' : '#444'} 
              />
            ))}
            <span>({product.reviews?.length || 0})</span>
          </CardRating>
          
          <CardPriceContainer>
            {discountedPrice ? (
              <>
                <CardDiscountedPrice>{formatPrice(discountedPrice)}</CardDiscountedPrice>
                <CardOriginalPrice>{formatPrice(product.price)}</CardOriginalPrice>
              </>
            ) : (
              <CardPrice>{formatPrice(product.price)}</CardPrice>
            )}
          </CardPriceContainer>
          
          <CardPlatform>Platform: {product.platform}</CardPlatform>
        </CardBody>
      </Link>
      
      <CardFooter>
        <AddToCartButton onClick={handleAddToCart}>
          <FaShoppingCart /> Add to Cart
        </AddToCartButton>
      </CardFooter>
    </Card>
  );
};

const Card = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
    background-color: var(--hover-background);
  }
  
  a {
    text-decoration: none;
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    flex: 1;
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
`;

const ImageContainer = styled.div`
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio for YouTube thumbnails */
  position: relative;
  background-color: #000;
  overflow: hidden;
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const CardBody = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CardCategory = styled.span`
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-color);
`;

const CardRating = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  
  span {
    margin-left: 0.5rem;
    font-size: 0.85rem;
    color: var(--light-text);
  }
`;

const CardPriceContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const CardPrice = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
`;

const CardDiscountedPrice = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-right: 0.75rem;
`;

const CardOriginalPrice = styled.span`
  font-size: 0.9rem;
  color: var(--light-text);
  text-decoration: line-through;
`;

const CardPlatform = styled.div`
  font-size: 0.85rem;
  color: var(--light-text);
  margin-top: auto;
`;

const CardFooter = styled.div`
  padding: 1rem 1.25rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-top: 1px solid #333333;
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
`;

export default ProductCard; 