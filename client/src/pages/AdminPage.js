import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaKey, FaUser, FaChartBar, FaBox, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, user, navigate]);
  
  // Fetch data based on active tab
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      if (activeTab === 'dashboard') {
        fetchDashboardData();
      } else if (activeTab === 'products') {
        fetchProducts();
      } else if (activeTab === 'users') {
        fetchUsers();
      }
    }
  }, [isAuthenticated, user, activeTab]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get('/api/admin/dashboard');
      
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get('/api/admin/products');
      
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get('/api/admin/users');
      
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const res = await api.delete(`/api/admin/products/${productId}`);
      
      if (res.data.success) {
        setProducts(products.filter(product => product._id !== productId));
        alert('Product deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };
  
  if (authLoading) {
    return (
      <LoadingContainer>
        <div className="container">
          <LoadingMessage>Loading admin panel...</LoadingMessage>
        </div>
      </LoadingContainer>
    );
  }
  
  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <AdminContainer>
      <div className="container">
        <AdminHeader>
          <h1>Admin Panel</h1>
        </AdminHeader>
        
        <AdminContent>
          <AdminSidebar>
            <AdminTabs>
              <AdminTab
                isActive={activeTab === 'dashboard'}
                onClick={() => handleTabChange('dashboard')}
              >
                <FaChartBar /> Dashboard
              </AdminTab>
              <AdminTab
                isActive={activeTab === 'products'}
                onClick={() => handleTabChange('products')}
              >
                <FaBox /> Products
              </AdminTab>
              <AdminTab
                isActive={activeTab === 'users'}
                onClick={() => handleTabChange('users')}
              >
                <FaUser /> Users
              </AdminTab>
            </AdminTabs>
          </AdminSidebar>
          
          <AdminMain>
            {loading ? (
              <LoadingMessage>Loading data...</LoadingMessage>
            ) : error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : (
              <>
                {activeTab === 'dashboard' && dashboardData && (
                  <AdminSection>
                    <SectionTitle>Dashboard</SectionTitle>
                    
                    <StatCards>
                      <StatCard>
                        <StatCardIcon>
                          <FaBox />
                        </StatCardIcon>
                        <StatCardContent>
                          <StatCardValue>{dashboardData.counts.products}</StatCardValue>
                          <StatCardLabel>Products</StatCardLabel>
                        </StatCardContent>
                      </StatCard>
                      
                      <StatCard>
                        <StatCardIcon>
                          <FaUser />
                        </StatCardIcon>
                        <StatCardContent>
                          <StatCardValue>{dashboardData.counts.users}</StatCardValue>
                          <StatCardLabel>Users</StatCardLabel>
                        </StatCardContent>
                      </StatCard>
                    </StatCards>
                    
                    <DashboardSection>
                      <DashboardSectionTitle>Recent Products</DashboardSectionTitle>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>Price</TableHeader>
                            <TableHeader>Category</TableHeader>
                            <TableHeader>Available Keys</TableHeader>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.recentProducts.map(product => (
                            <TableRow key={product._id}>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>₹{product.price.toFixed(2)}</TableCell>
                              <TableCell>{product.category}</TableCell>
                              <TableCell>
                                {product.availableKeys.filter(key => !key.isSold).length}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </DashboardSection>
                    
                    <DashboardSection>
                      <DashboardSectionTitle>Low Stock Products</DashboardSectionTitle>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>Price</TableHeader>
                            <TableHeader>Category</TableHeader>
                            <TableHeader>Available Keys</TableHeader>
                            <TableHeader>Actions</TableHeader>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.lowKeyProducts.map(product => (
                            <TableRow key={product._id}>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>₹{product.price.toFixed(2)}</TableCell>
                              <TableCell>{product.category}</TableCell>
                              <TableCell>
                                {product.availableKeys.filter(key => !key.isSold).length}
                              </TableCell>
                              <TableCell>
                                <ActionButton as={Link} to={`/admin/products/${product._id}/keys`}>
                                  <FaKey /> Add Keys
                                </ActionButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </DashboardSection>
                  </AdminSection>
                )}
                
                {activeTab === 'products' && (
                  <AdminSection>
                    <SectionHeader>
                      <SectionTitle>Products</SectionTitle>
                      <ActionButton as={Link} to="/admin/products/new">
                        <FaPlus /> Add Product
                      </ActionButton>
                    </SectionHeader>
                    
                    {products.length === 0 ? (
                      <EmptyState>
                        <EmptyStateIcon>
                          <FaExclamationTriangle />
                        </EmptyStateIcon>
                        <EmptyStateTitle>No products found</EmptyStateTitle>
                        <EmptyStateMessage>
                          You haven't added any products yet.
                        </EmptyStateMessage>
                        <ActionButton as={Link} to="/admin/products/new">
                          <FaPlus /> Add Product
                        </ActionButton>
                      </EmptyState>
                    ) : (
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>Price</TableHeader>
                            <TableHeader>Category</TableHeader>
                            <TableHeader>Available Keys</TableHeader>
                            <TableHeader>Actions</TableHeader>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {products.map(product => (
                            <TableRow key={product._id}>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>₹{product.price.toFixed(2)}</TableCell>
                              <TableCell>{product.category}</TableCell>
                              <TableCell>
                                {product.availableKeys.filter(key => !key.isSold).length}
                              </TableCell>
                              <TableCell>
                                <ActionButtons>
                                  <ActionButton as={Link} to={`/admin/products/${product._id}/edit`}>
                                    <FaEdit />
                                  </ActionButton>
                                  <ActionButton as={Link} to={`/admin/products/${product._id}/keys`}>
                                    <FaKey />
                                  </ActionButton>
                                  <ActionButton 
                                    onClick={() => handleDeleteProduct(product._id)}
                                    danger
                                  >
                                    <FaTrash />
                                  </ActionButton>
                                </ActionButtons>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </AdminSection>
                )}
                
                {activeTab === 'users' && (
                  <AdminSection>
                    <SectionTitle>Users</SectionTitle>
                    
                    {users.length === 0 ? (
                      <EmptyState>
                        <EmptyStateIcon>
                          <FaExclamationTriangle />
                        </EmptyStateIcon>
                        <EmptyStateTitle>No users found</EmptyStateTitle>
                        <EmptyStateMessage>
                          There are no registered users yet.
                        </EmptyStateMessage>
                      </EmptyState>
                    ) : (
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>Email</TableHeader>
                            <TableHeader>Role</TableHeader>
                            <TableHeader>Joined</TableHeader>
                            <TableHeader>Purchases</TableHeader>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {users.map(user => (
                            <TableRow key={user._id}>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.role}</TableCell>
                              <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {user.purchasedKeys ? user.purchasedKeys.length : 0}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </AdminSection>
                )}
              </>
            )}
          </AdminMain>
        </AdminContent>
      </div>
    </AdminContainer>
  );
};

const AdminContainer = styled.div`
  padding: 2rem 0 4rem;
`;

const AdminHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }
`;

const AdminContent = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AdminSidebar = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  height: fit-content;
`;

const AdminTabs = styled.div`
  display: flex;
  flex-direction: column;
`;

const AdminTab = styled.button`
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

const AdminMain = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  padding: 2rem;
`;

const AdminSection = styled.div``;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

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

const StatCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--hover-background);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const StatCardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
  margin-right: 1rem;
  
  svg {
    font-size: 1.5rem;
  }
`;

const StatCardContent = styled.div``;

const StatCardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--text-color);
`;

const StatCardLabel = styled.div`
  font-size: 0.9rem;
  color: var(--light-text);
`;

const DashboardSection = styled.div`
  margin-bottom: 2rem;
`;

const DashboardSectionTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: rgba(0, 0, 0, 0.2);
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #333333;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--light-text);
`;

const TableCell = styled.td`
  padding: 1rem;
  color: var(--text-color);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.danger ? 'var(--danger-color)' : 'var(--primary-color)'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: ${props => props.children.length > 1 ? '0.5rem 1rem' : '0.5rem'};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-decoration: none;
  
  svg {
    ${props => props.children.length > 1 ? 'margin-right: 0.5rem;' : ''}
  }
  
  &:hover {
    background-color: ${props => props.danger ? '#c82333' : 'var(--secondary-color)'};
  }
`;

const LoadingContainer = styled.div`
  padding: 4rem 0;
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 1.1rem;
  color: var(--light-text);
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
  color: #444;
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const EmptyStateMessage = styled.p`
  color: var(--light-text);
  margin-bottom: 1.5rem;
`;

export default AdminPage; 