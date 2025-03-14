import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { 
  FaStar, 
  FaShoppingCart, 
  FaArrowLeft, 
  FaWindows, 
  FaApple, 
  FaLinux, 
  FaAndroid, 
  FaMobileAlt, 
  FaGlobe 
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  
  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(`/api/products/${id}`);
        
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  // Check if user has purchased this product
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      console.log('Checking purchase status:', {
        isAuthenticated,
        userId: user?._id,
        productId: product?._id
      });
      
      if (isAuthenticated && user && product) {
        try {
          // Check if user has purchased this product
          console.log('Making request to check purchase status...');
          const res = await axios.get(`/api/users/has-purchased/${product._id}`);
          console.log('Purchase status response:', res.data);
          
          if (res.data.success) {
            console.log('Setting hasPurchased to:', res.data.hasPurchased);
            setHasPurchased(res.data.hasPurchased);
          } else {
            console.error('Failed to check purchase status:', res.data);
            setHasPurchased(false);
          }
        } catch (err) {
          console.error('Error checking purchase status:', err);
          console.error('Error response:', err.response?.data);
          setHasPurchased(false);
        }
      } else {
        console.log('Not authenticated or missing user/product data');
        setHasPurchased(false);
      }
    };
    
    checkPurchaseStatus();
  }, [isAuthenticated, user, product]);
  
  // Calculate discounted price
  const discountedPrice = product?.discount > 0 
    ? product.price - (product.price * (product.discount / 100)) 
    : null;
  
  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = async () => {
    setAddingToCart(true);
    
    try {
      const success = await addToCart(product._id, quantity);
      
      if (success) {
        // Show success message or redirect to cart
        navigate('/cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };
  
  // Handle review form change
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: name === 'rating' ? parseInt(value) : value
    });
  };
  
  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    console.log('Submitting review:', reviewForm);
    setSubmittingReview(true);
    setReviewError(null);
    
    try {
      console.log('Sending review to:', `/api/products/${id}/reviews`);
      const res = await axios.post(`/api/products/${id}/reviews`, reviewForm);
      console.log('Review submission response:', res.data);
      
      if (res.data.success) {
        // Refresh product to show new review
        const productRes = await axios.get(`/api/products/${id}`);
        if (productRes.data.success) {
          setProduct(productRes.data.product);
        }
        
        // Reset form
        setReviewForm({
          rating: 5,
          comment: ''
        });
      }
    } catch (err) {
      console.error('Error submitting review - full error:', err);
      console.error('Error response data:', err.response?.data);
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };
  
  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'windows':
        return <FaWindows />;
      case 'mac':
        return <FaApple />;
      case 'linux':
        return <FaLinux />;
      case 'android':
        return <FaAndroid />;
      case 'ios':
        return <FaMobileAlt />;
      case 'cross-platform':
        return <FaGlobe />;
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <LoadingContainer>
        <div className="container">
          <LoadingMessage>Loading product details...</LoadingMessage>
        </div>
      </LoadingContainer>
    );
  }
  
  if (error || !product) {
    return (
      <ErrorContainer>
        <div className="container">
          <ErrorMessage>{error || 'Product not found'}</ErrorMessage>
          <BackButton to="/products">
            <FaArrowLeft /> Back to Products
          </BackButton>
        </div>
      </ErrorContainer>
    );
  }
  
  return (
    <ProductDetailContainer>
      <div className="container">
        <Breadcrumbs>
          <BreadcrumbLink to="/">Home</BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbLink to="/products">Products</BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbLink to={`/products?category=${product.category}`}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbCurrent>{product.name}</BreadcrumbCurrent>
        </Breadcrumbs>
        
        <ProductContent>
          <ProductImageContainer>
            <ProductImage src={product.imageUrl} alt={product.name} />
            {product.discount > 0 && (
              <DiscountBadge>-{product.discount}%</DiscountBadge>
            )}
          </ProductImageContainer>
          
          <ProductInfo>
            <ProductCategory>
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </ProductCategory>
            <ProductName>{product.name}</ProductName>
            
            <ProductRating>
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  color={i < Math.round(product.rating) ? '#f39c12' : '#ddd'} 
                />
              ))}
              <span>({product.reviews?.length || 0} reviews)</span>
            </ProductRating>
            
            <ProductPriceContainer>
              {discountedPrice ? (
                <>
                  <ProductDiscountedPrice>{formatPrice(discountedPrice)}</ProductDiscountedPrice>
                  <ProductOriginalPrice>{formatPrice(product.price)}</ProductOriginalPrice>
                </>
              ) : (
                <ProductPrice>{formatPrice(product.price)}</ProductPrice>
              )}
            </ProductPriceContainer>
            
            <ProductMeta>
              <MetaItem>
                <MetaLabel>Publisher:</MetaLabel>
                <MetaValue>{product.publisher}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Platform:</MetaLabel>
                <MetaValue>
                  {getPlatformIcon(product.platform)}
                  {product.platform.charAt(0).toUpperCase() + product.platform.slice(1)}
                </MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Availability:</MetaLabel>
                <MetaValue>
                  {product.availableKeys && product.availableKeys.some(key => !key.isSold) 
                    ? <InStock>In Stock</InStock> 
                    : <OutOfStock>Out of Stock</OutOfStock>}
                </MetaValue>
              </MetaItem>
            </ProductMeta>
            
            <ProductDescription>
              <h3>Description</h3>
              <p>{product.description}</p>
            </ProductDescription>
            
            <AddToCartSection>
              <QuantityControl>
                <QuantityLabel>Quantity:</QuantityLabel>
                <QuantityInput
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </QuantityControl>
              
              <AddToCartButton 
                onClick={handleAddToCart}
                disabled={addingToCart || !product.availableKeys?.some(key => !key.isSold)}
              >
                {addingToCart ? 'Adding...' : (
                  <>
                    <FaShoppingCart /> Add to Cart
                  </>
                )}
              </AddToCartButton>
            </AddToCartSection>
          </ProductInfo>
        </ProductContent>
        
        <ReviewsSection>
          <SectionTitle>Customer Reviews</SectionTitle>
          
          <ReviewForm onSubmit={handleSubmitReview}>
            <h3>Write a Review</h3>
            
            {reviewError && <ReviewErrorMessage>{reviewError}</ReviewErrorMessage>}
            
            <FormGroup>
              <label>Rating:</label>
              <RatingSelect
                name="rating"
                value={reviewForm.rating}
                onChange={handleReviewChange}
              >
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Very Good</option>
                <option value="3">3 Stars - Good</option>
                <option value="2">2 Stars - Fair</option>
                <option value="1">1 Star - Poor</option>
              </RatingSelect>
            </FormGroup>
            
            <FormGroup>
              <label>Comment:</label>
              <CommentTextarea
                name="comment"
                value={reviewForm.comment}
                onChange={handleReviewChange}
                placeholder="Share your experience with this product..."
                required
              />
            </FormGroup>
            
            <SubmitReviewButton type="submit" disabled={submittingReview || !hasPurchased}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </SubmitReviewButton>
            
            {!isAuthenticated ? (
              <LoginPrompt>
                Please <Link to="/login">login</Link> to leave a review
              </LoginPrompt>
            ) : !hasPurchased ? (
              <ReviewNote>
                You need to purchase this product before you can submit a review
              </ReviewNote>
            ) : (
              <ReviewNote>
                As a verified customer, your review helps others make informed decisions
              </ReviewNote>
            )}
          </ReviewForm>
          
          <ReviewsList>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review, index) => (
                <ReviewItem key={index}>
                  <ReviewHeader>
                    <ReviewAuthor>{review.user?.name || 'Anonymous'}</ReviewAuthor>
                    <ReviewRating>
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          color={i < review.rating ? '#f39c12' : '#ddd'} 
                          size={14}
                        />
                      ))}
                    </ReviewRating>
                    <ReviewDate>
                      {new Date(review.date).toLocaleDateString()}
                    </ReviewDate>
                  </ReviewHeader>
                  <ReviewComment>{review.comment}</ReviewComment>
                </ReviewItem>
              ))
            ) : (
              <NoReviews>No reviews yet. Be the first to review this product!</NoReviews>
            )}
          </ReviewsList>
        </ReviewsSection>
      </div>
    </ProductDetailContainer>
  );
};

const ProductDetailContainer = styled.div`
  padding: 2rem 0 4rem;
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const BreadcrumbLink = styled(Link)`
  color: var(--primary-color);
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  margin: 0 0.5rem;
  color: var(--light-text);
`;

const BreadcrumbCurrent = styled.span`
  color: var(--light-text);
  font-size: 0.9rem;
`;

const ProductContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ProductImageContainer = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  background-color: #000;
  padding-top: 56.25%; /* 16:9 Aspect Ratio for YouTube thumbnails */
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: var(--accent-color);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductCategory = styled.div`
  text-transform: uppercase;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const ProductName = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  line-height: 1.3;
  color: var(--text-color);
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  
  svg {
    margin-right: 0.25rem;
  }
  
  span {
    margin-left: 0.5rem;
    color: var(--light-text);
    font-size: 0.9rem;
  }
`;

const ProductPriceContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ProductPrice = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
`;

const ProductDiscountedPrice = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-right: 1rem;
`;

const ProductOriginalPrice = styled.div`
  font-size: 1.25rem;
  color: var(--light-text);
  text-decoration: line-through;
`;

const ProductMeta = styled.div`
  margin-bottom: 1.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
`;

const MetaLabel = styled.div`
  width: 100px;
  font-weight: 600;
  color: var(--light-text);
`;

const MetaValue = styled.div`
  display: flex;
  align-items: center;
  color: var(--text-color);
  
  svg {
    margin-right: 0.5rem;
  }
`;

const InStock = styled.span`
  color: var(--success-color);
  font-weight: 600;
`;

const OutOfStock = styled.span`
  color: var(--danger-color);
  font-weight: 600;
`;

const ProductDescription = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--text-color);
  }
  
  p {
    line-height: 1.6;
    color: var(--light-text);
  }
`;

const AddToCartSection = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
  
  @media (max-width: 576px) {
    margin-bottom: 1rem;
    width: 100%;
  }
`;

const QuantityLabel = styled.label`
  margin-right: 0.5rem;
  font-weight: 600;
  color: var(--light-text);
`;

const QuantityInput = styled.input`
  width: 60px;
  padding: 0.5rem;
  border: 1px solid #333333;
  border-radius: 4px;
  text-align: center;
  background-color: #222222;
  color: var(--text-color);
`;

const AddToCartButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover:not(:disabled) {
    background-color: var(--secondary-color);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const ReviewsSection = styled.div`
  margin-top: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  color: var(--text-color);
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -10px;
    width: 50px;
    height: 3px;
    background-color: var(--primary-color);
  }
`;

const ReviewForm = styled.form`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  padding: 1.5rem;
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
    color: var(--text-color);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--light-text);
  }
`;

const RatingSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #333333;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #222222;
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #333333;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  background-color: #222222;
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SubmitReviewButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: var(--secondary-color);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LoginPrompt = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
  
  a {
    color: var(--primary-color);
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ReviewErrorMessage = styled.div`
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--danger-color);
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewItem = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ReviewAuthor = styled.div`
  font-weight: 600;
  margin-right: 1rem;
`;

const ReviewRating = styled.div`
  display: flex;
  margin-right: 1rem;
`;

const ReviewDate = styled.div`
  font-size: 0.85rem;
  color: #999;
`;

const ReviewComment = styled.div`
  line-height: 1.6;
  color: #666;
`;

const NoReviews = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: #666;
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

const ReviewNote = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--light-text);
  font-style: italic;
`;

export default ProductDetailPage; 