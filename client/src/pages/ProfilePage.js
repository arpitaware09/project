import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaKey, FaClipboard, FaCheck, FaDownload, FaExclamationTriangle, FaExternalLinkAlt, FaVideo } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState({});
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // Fetch purchased products
  useEffect(() => {
    if (isAuthenticated && activeTab === 'purchases') {
      fetchPurchasedProducts();
    }
  }, [isAuthenticated, activeTab]);
  
  const fetchPurchasedProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching purchased products...');
      const res = await api.get('/api/auth/purchased-products');
      
      console.log('API response:', res.data);
      
      if (res.data.success) {
        console.log('Purchased products:', res.data.products);
        setPurchasedProducts(res.data.products || []);
      } else {
        console.error('API returned success: false');
        setError('Failed to fetch your purchased products');
      }
    } catch (err) {
      console.error('Error fetching purchased products:', err);
      setError('Failed to fetch your purchased products');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess({ ...copySuccess, [keyId]: true });
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setCopySuccess({ ...copySuccess, [keyId]: false });
        }, 3000);
      },
      () => {
        setCopySuccess({ ...copySuccess, [keyId]: false });
      }
    );
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const ensureValidUrl = (url) => {
    if (!url) return '';
    
    // Check if the URL already has a protocol
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Add https:// prefix if the URL doesn't have one
    return `https://${url}`;
  };
  
  if (authLoading) {
    return (
      <LoadingContainer>
        <div className="container">
          <LoadingMessage>Loading profile...</LoadingMessage>
        </div>
      </LoadingContainer>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <ProfileContainer>
      <div className="container">
        <ProfileHeader>
          <h1>My Account</h1>
        </ProfileHeader>
        
        <ProfileContent>
          <ProfileSidebar>
            <ProfileAvatar>
              <FaUser />
              <ProfileName>{user?.name}</ProfileName>
            </ProfileAvatar>
            
            <ProfileTabs>
              <ProfileTab
                isActive={activeTab === 'profile'}
                onClick={() => handleTabChange('profile')}
              >
                <FaUser /> Profile
              </ProfileTab>
              <ProfileTab
                isActive={activeTab === 'purchases'}
                onClick={() => handleTabChange('purchases')}
              >
                <FaKey /> My Purchases
              </ProfileTab>
            </ProfileTabs>
            
            <LogoutButton onClick={handleLogout}>
              Logout
            </LogoutButton>
          </ProfileSidebar>
          
          <ProfileMain>
            {activeTab === 'profile' && (
              <ProfileSection>
                <SectionTitle>Profile Information</SectionTitle>
                
                <ProfileInfo>
                  <ProfileInfoItem>
                    <ProfileInfoLabel>Name:</ProfileInfoLabel>
                    <ProfileInfoValue>{user?.name}</ProfileInfoValue>
                  </ProfileInfoItem>
                  
                  <ProfileInfoItem>
                    <ProfileInfoLabel>Email:</ProfileInfoLabel>
                    <ProfileInfoValue>{user?.email}</ProfileInfoValue>
                  </ProfileInfoItem>
                  
                  <ProfileInfoItem>
                    <ProfileInfoLabel>Member Since:</ProfileInfoLabel>
                    <ProfileInfoValue>
                      {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </ProfileInfoValue>
                  </ProfileInfoItem>
                </ProfileInfo>
                
                <ProfileActions>
                  <ProfileActionButton as={Link} to="/products">
                    Browse Products
                  </ProfileActionButton>
                </ProfileActions>
              </ProfileSection>
            )}
            
            {activeTab === 'purchases' && (
              <ProfileSection>
                <SectionTitle>My Purchases</SectionTitle>
                
                {loading ? (
                  <LoadingMessage>Loading your purchases...</LoadingMessage>
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : purchasedProducts.length === 0 ? (
                  <EmptyState>
                    <EmptyStateIcon>
                      <FaExclamationTriangle />
                    </EmptyStateIcon>
                    <EmptyStateTitle>No purchases found</EmptyStateTitle>
                    <EmptyStateMessage>
                      You haven't purchased any products yet.
                    </EmptyStateMessage>
                    <ProfileActionButton as={Link} to="/products">
                      Browse Products
                    </ProfileActionButton>
                  </EmptyState>
                ) : (
                  <PurchasedProductsList>
                    {purchasedProducts.map((item) => (
                      <PurchasedProductItem key={item.id}>
                        <PurchasedProductImage 
                          src={item.product?.imageUrl || 'https://placehold.co/500x300?text=No+Image'} 
                          alt={item.product?.name || 'Product'} 
                        />
                        
                        <PurchasedProductDetails>
                          <PurchasedProductName>
                            {item.product ? (
                              <Link to={`/products/${item.product._id}`}>{item.product.name}</Link>
                            ) : (
                              'Unknown Product'
                            )}
                          </PurchasedProductName>
                          
                          <PurchasedProductMeta>
                            <PurchasedProductCategory>
                              {item.product?.category || 'N/A'}
                            </PurchasedProductCategory>
                            <PurchasedProductDate>
                              Purchased on: {formatDate(item.purchaseDate)}
                            </PurchasedProductDate>
                          </PurchasedProductMeta>
                          
                          <PurchasedProductKeys>
                            <PurchasedProductKeysTitle>
                              Product Key:
                            </PurchasedProductKeysTitle>
                            
                            <PurchasedProductKey key={item.id}>
                              <PurchasedProductKeyValue>
                                {item.key}
                              </PurchasedProductKeyValue>
                              
                              <PurchasedProductKeyActions>
                                <CopyButton
                                  onClick={() => copyToClipboard(item.key, item.id)}
                                  title="Copy to clipboard"
                                >
                                  {copySuccess[item.id] ? <FaCheck /> : <FaClipboard />}
                                </CopyButton>
                              </PurchasedProductKeyActions>
                            </PurchasedProductKey>
                          </PurchasedProductKeys>
                          
                          <PurchasedProductLinks>
                            {(item.applicationLink || item.product?.applicationProcess) && (
                              <LinkButton 
                                href={ensureValidUrl(item.applicationLink || item.product?.applicationProcess)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <FaExternalLinkAlt /> EXE Download
                              </LinkButton>
                            )}
                            
                            {(item.videoTutorialLink || item.product?.videoTutorial) && (
                              <LinkButton 
                                href={ensureValidUrl(item.videoTutorialLink || item.product?.videoTutorial)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <FaVideo /> Apply Process
                              </LinkButton>
                            )}
                          </PurchasedProductLinks>
                        </PurchasedProductDetails>
                      </PurchasedProductItem>
                    ))}
                  </PurchasedProductsList>
                )}
              </ProfileSection>
            )}
          </ProfileMain>
        </ProfileContent>
      </div>
    </ProfileContainer>
  );
};

const ProfileContainer = styled.div`
  padding: 2rem 0 4rem;
`;

const ProfileHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
`;

const ProfileContent = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileSidebar = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  height: fit-content;
`;

const ProfileAvatar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: var(--primary-color);
  color: white;
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
`;

const ProfileName = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
`;

const ProfileTabs = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProfileTab = styled.button`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: ${props => props.isActive ? 'var(--hover-background)' : 'transparent'};
  color: ${props => props.isActive ? 'var(--primary-color)' : 'var(--light-text)'};
  border: none;
  text-align: left;
  font-size: 1rem;
  font-weight: ${props => props.isActive ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid ${props => props.isActive ? 'var(--primary-color)' : 'transparent'};
  
  svg {
    margin-right: 0.75rem;
  }
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: transparent;
  color: var(--danger-color);
  border: none;
  border-top: 1px solid #333333;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(220, 53, 69, 0.1);
  }
`;

const ProfileMain = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  padding: 2rem;
`;

const ProfileSection = styled.div``;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  position: relative;
  color: var(--text-color);
  
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

const ProfileInfo = styled.div`
  margin-bottom: 2rem;
`;

const ProfileInfoItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const ProfileInfoLabel = styled.div`
  width: 150px;
  font-weight: 600;
  color: var(--light-text);
  
  @media (max-width: 576px) {
    width: 100%;
    margin-bottom: 0.25rem;
  }
`;

const ProfileInfoValue = styled.div`
  flex: 1;
  color: var(--text-color);
`;

const ProfileActions = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const ProfileActionButton = styled.button`
  display: inline-flex;
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
  text-decoration: none;
  
  &:hover {
    background-color: var(--secondary-color);
  }
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const PurchasedProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PurchasedProductItem = styled.div`
  display: flex;
  background-color: var(--hover-background);
  border-radius: 8px;
  overflow: hidden;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const PurchasedProductImage = styled.img`
  width: 150px;
  height: 150px;
  object-fit: cover;
  
  @media (max-width: 576px) {
    width: 100%;
    height: 200px;
  }
`;

const PurchasedProductDetails = styled.div`
  flex: 1;
  padding: 1.5rem;
`;

const PurchasedProductName = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  
  a {
    color: var(--text-color);
    text-decoration: none;
    
    &:hover {
      color: var(--primary-color);
    }
  }
`;

const PurchasedProductMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--light-text);
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 0.25rem;
  }
`;

const PurchasedProductCategory = styled.div`
  text-transform: capitalize;
`;

const PurchasedProductDate = styled.div``;

const PurchasedProductKeys = styled.div`
  margin-top: 1rem;
`;

const PurchasedProductKeysTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const PurchasedProductKey = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--hover-background);
  border: 1px solid #333333;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PurchasedProductKeyValue = styled.div`
  flex: 1;
  font-family: monospace;
  font-size: 0.9rem;
  word-break: break-all;
  color: var(--text-color);
`;

const PurchasedProductKeyActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  color: var(--light-text);
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--primary-color);
  }
`;

const PurchasedProductLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  margin-right: 0.5rem;
  transition: all 0.3s ease;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const ErrorMessage = styled.div`
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--danger-color);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 0;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const EmptyStateMessage = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
`;

export default ProfilePage; 