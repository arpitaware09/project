import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <NotFoundContainer>
      <div className="container">
        <NotFoundContent>
          <ErrorCode>404</ErrorCode>
          <ErrorTitle>Page Not Found</ErrorTitle>
          <ErrorMessage>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </ErrorMessage>
          
          <ButtonGroup>
            <HomeButton to="/">
              <FaHome /> Go to Homepage
            </HomeButton>
            <ProductsButton to="/products">
              <FaSearch /> Browse Products
            </ProductsButton>
          </ButtonGroup>
        </NotFoundContent>
      </div>
    </NotFoundContainer>
  );
};

const NotFoundContainer = styled.div`
  padding: 6rem 0;
  background-color: var(--light-color);
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
`;

const NotFoundContent = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
  line-height: 1;
  
  @media (max-width: 576px) {
    font-size: 6rem;
  }
`;

const ErrorTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--dark-color);
  
  @media (max-width: 576px) {
    font-size: 2rem;
  }
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
  }
`;

const HomeButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
  }
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const ProductsButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: rgba(52, 152, 219, 0.1);
    transform: translateY(-2px);
  }
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

export default NotFoundPage; 