import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowRight, FaWindows, FaApple, FaLinux, FaAndroid } from 'react-icons/fa';
import ProductCard from '../components/products/ProductCard';
import Lottie from 'lottie-react';
import api from '../utils/api'; // Import the API utility

// Import Lottie animations
import keyAnimation from '../assets/animations/key-animation.json';
import gameAnimation from '../assets/animations/game-animation.json';
import softwareAnimation from '../assets/animations/software-animation.json';
import osAnimation from '../assets/animations/os-animation.json';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await api.get('/api/products?featured=true&limit=4');
        if (res.data.success) {
          setFeaturedProducts(res.data.products);
        }
      } catch (err) {
        setError('Failed to fetch featured products');
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      <HeroSection>
        <div className="container">
          <HeroContent>
            <HeroText>
              <h1>Authentic ESP keys at the best price</h1>
              <p>
                Get instant access to your favorite software, games, and digital products with our secure and reliable key marketplace.
              </p>
              <HeroButtons>
                <PrimaryButton to="/products">
                  Browse Products <FaArrowRight />
                </PrimaryButton>
                <SecondaryButton to="/products?category=games">
                  Explore Games
                </SecondaryButton>
              </HeroButtons>
            </HeroText>
            <HeroImageContainer>
              <HeroImage 
                src="/images/hero-image.jpg" 
                alt="Quick Axis Digital Keys" 
              />
            </HeroImageContainer>
          </HeroContent>
        </div>
      </HeroSection>

      <FeaturedSection>
        <div className="container">
          <SectionHeader>
            <h2>Featured Products</h2>
            <ViewAllLink to="/products">View All Products <FaArrowRight /></ViewAllLink>
          </SectionHeader>

          {loading ? (
            <LoadingMessage>Loading featured products...</LoadingMessage>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            <ProductGrid>
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </ProductGrid>
          )}
        </div>
      </FeaturedSection>

      <CategoriesSection>
        <div className="container">
          <SectionHeader>
            <h2>Browse by Category</h2>
          </SectionHeader>

          <CategoryGrid>
            <CategoryCard to="/products?category=esp-keys">
              <CategoryAnimationContainer className="esp-keys">
                <Lottie animationData={keyAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
              </CategoryAnimationContainer>
              <h3>ESP Keys</h3>
              <p>Premium ESP activation keys</p>
            </CategoryCard>

            <CategoryCard to="/products?category=games">
              <CategoryAnimationContainer className="games">
                <Lottie animationData={gameAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
              </CategoryAnimationContainer>
              <h3>Games</h3>
              <p>Latest PC and console game keys</p>
            </CategoryCard>

            <CategoryCard to="/products?category=software">
              <CategoryAnimationContainer className="software">
                <Lottie animationData={softwareAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
              </CategoryAnimationContainer>
              <h3>Software</h3>
              <p>Professional and creative software</p>
            </CategoryCard>

            <CategoryCard to="/products?category=operating-systems">
              <CategoryAnimationContainer className="os">
                <Lottie animationData={osAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
              </CategoryAnimationContainer>
              <h3>Operating Systems</h3>
              <p>Windows, macOS and Linux keys</p>
            </CategoryCard>
          </CategoryGrid>
        </div>
      </CategoriesSection>

      <PlatformsSection>
        <div className="container">
          <SectionHeader>
            <h2>Available Platforms</h2>
          </SectionHeader>

          <PlatformGrid>
            <PlatformCard to="/products?platform=windows">
              <FaWindows />
              <h3>Windows</h3>
            </PlatformCard>

            <PlatformCard to="/products?platform=mac">
              <FaApple />
              <h3>Mac</h3>
            </PlatformCard>

            <PlatformCard to="/products?platform=linux">
              <FaLinux />
              <h3>Linux</h3>
            </PlatformCard>

            <PlatformCard to="/products?platform=android">
              <FaAndroid />
              <h3>Android</h3>
            </PlatformCard>
          </PlatformGrid>
        </div>
      </PlatformsSection>

      <CTASection>
        <div className="container">
          <CTAContent>
            <h2>Ready to get started?</h2>
            <p>Browse our collection of authentic digital keys and start downloading today.</p>
            <PrimaryButton to="/products">Shop Now <FaArrowRight /></PrimaryButton>
          </CTAContent>
        </div>
      </CTASection>
    </div>
  );
};

const HeroSection = styled.section`
  padding: 4rem 0;
  background: linear-gradient(135deg, #000000 0%, #141414 100%);
  color: white;
`;

const HeroContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroText = styled.div`
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    line-height: 1.2;
  }
  
  p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }
  
  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const PrimaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: var(--primary-color);
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    background-color: var(--light-color);
    transform: translateY(-2px);
  }
`;

const SecondaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
`;

const HeroImageContainer = styled.div`
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.05);
  overflow: hidden;
`;

const HeroImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.75rem;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -10px;
      width: 50px;
      height: 3px;
      background-color: var(--primary-color);
    }
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ViewAllLink = styled(Link)`
  display: flex;
  align-items: center;
  color: var(--primary-color);
  font-weight: 600;
  
  svg {
    margin-left: 0.5rem;
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateX(5px);
  }
`;

const FeaturedSection = styled.section`
  padding: 4rem 0;
  background-color: var(--background-color);
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: var(--danger-color);
`;

const CategoriesSection = styled.section`
  padding: 4rem 0;
  background-color: var(--light-color);
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled(Link)`
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  text-decoration: none;
  color: var(--text-color);
  
  h3 {
    margin: 1rem 0 0.5rem;
    font-size: 1.25rem;
    color: var(--text-color);
  }
  
  p {
    color: var(--light-text);
    font-size: 0.9rem;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
    background-color: var(--hover-background);
  }
`;

const CategoryAnimationContainer = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  
  &.esp-keys {
    background-color: rgba(229, 9, 20, 0.1);
  }
  
  &.games {
    background-color: rgba(155, 89, 182, 0.1);
  }
  
  &.software {
    background-color: rgba(52, 152, 219, 0.1);
  }
  
  &.os {
    background-color: rgba(243, 156, 18, 0.1);
  }
`;

const PlatformsSection = styled.section`
  padding: 4rem 0;
  background-color: var(--hover-background);
`;

const PlatformGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const PlatformCard = styled(Link)`
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease, background-color 0.3s ease;
  text-decoration: none;
  color: var(--text-color);
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
  }
  
  h3 {
    font-size: 1.25rem;
    color: var(--text-color);
  }
  
  &:hover {
    transform: translateY(-5px);
    background-color: var(--primary-color);
    color: white;
    
    svg {
      color: white;
    }
  }
`;

const CTASection = styled.section`
  padding: 4rem 0;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
`;

const CTAContent = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
  
  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }
`;

export default HomePage; 