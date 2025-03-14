import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminProductKeysPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newKeys, setNewKeys] = useState([{ key: '', applicationLink: '', videoTutorialLink: '' }]);
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, user, navigate]);
  
  // Fetch product data
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin' && id) {
      fetchProduct();
    }
  }, [isAuthenticated, user, id]);
  
  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get(`/api/admin/products/${id}`);
      
      if (res.data.success) {
        setProduct(res.data.product);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewKeyChange = (index, field, value) => {
    const updatedKeys = [...newKeys];
    updatedKeys[index][field] = value;
    setNewKeys(updatedKeys);
  };
  
  const addNewKeyField = () => {
    setNewKeys([...newKeys, { key: '', applicationLink: '', videoTutorialLink: '' }]);
  };
  
  const removeNewKeyField = (index) => {
    const updatedKeys = [...newKeys];
    updatedKeys.splice(index, 1);
    setNewKeys(updatedKeys);
  };
  
  const handleAddKeys = async () => {
    // Validate keys
    const validKeys = newKeys.filter(key => key.key.trim() !== '');
    
    if (validKeys.length === 0) {
      alert('Please enter at least one valid key');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await api.post(`/api/admin/products/${id}/keys`, {
        keys: validKeys
      });
      
      if (res.data.success) {
        alert(`${validKeys.length} keys added successfully`);
        setNewKeys([{ key: '', applicationLink: '', videoTutorialLink: '' }]);
        fetchProduct(); // Refresh product data
      }
    } catch (err) {
      console.error('Error adding keys:', err);
      alert('Failed to add keys');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this key?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await api.delete(`/api/admin/products/${id}/keys/${keyId}`);
      
      if (res.data.success) {
        alert('Key deleted successfully');
        fetchProduct(); // Refresh product data
      }
    } catch (err) {
      console.error('Error deleting key:', err);
      alert('Failed to delete key');
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading || loading) {
    return (
      <LoadingContainer>
        <div className="container">
          <LoadingMessage>Loading...</LoadingMessage>
        </div>
      </LoadingContainer>
    );
  }
  
  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null; // Will redirect in useEffect
  }
  
  if (error) {
    return (
      <ErrorContainer>
        <div className="container">
          <ErrorMessage>{error}</ErrorMessage>
          <BackButton as={Link} to="/admin">
            <FaArrowLeft /> Back to Admin Panel
          </BackButton>
        </div>
      </ErrorContainer>
    );
  }
  
  if (!product) {
    return (
      <LoadingContainer>
        <div className="container">
          <LoadingMessage>Loading product...</LoadingMessage>
        </div>
      </LoadingContainer>
    );
  }
  
  return (
    <PageContainer>
      <div className="container">
        <PageHeader>
          <BackButton as={Link} to="/admin">
            <FaArrowLeft /> Back to Admin Panel
          </BackButton>
          <h1>Manage Keys: {product.name}</h1>
        </PageHeader>
        
        <ProductInfo>
          <ProductInfoItem>
            <ProductInfoLabel>Product:</ProductInfoLabel>
            <ProductInfoValue>{product.name}</ProductInfoValue>
          </ProductInfoItem>
          
          <ProductInfoItem>
            <ProductInfoLabel>Price:</ProductInfoLabel>
            <ProductInfoValue>₹{product.price.toFixed(2)}</ProductInfoValue>
          </ProductInfoItem>
          
          <ProductInfoItem>
            <ProductInfoLabel>Category:</ProductInfoLabel>
            <ProductInfoValue>{product.category}</ProductInfoValue>
          </ProductInfoItem>
          
          <ProductInfoItem>
            <ProductInfoLabel>Available Keys:</ProductInfoLabel>
            <ProductInfoValue>
              {product.availableKeys.filter(key => !key.isSold).length} / {product.availableKeys.length}
            </ProductInfoValue>
          </ProductInfoItem>
        </ProductInfo>
        
        <Section>
          <SectionTitle>Current Keys</SectionTitle>
          
          {product.availableKeys.length === 0 ? (
            <EmptyState>
              <EmptyStateMessage>No keys added yet</EmptyStateMessage>
            </EmptyState>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Key</TableHeader>
                  <TableHeader>Application Link</TableHeader>
                  <TableHeader>Video Tutorial Link</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {product.availableKeys.map(key => (
                  <TableRow key={key._id}>
                    <TableCell>{key.key}</TableCell>
                    <TableCell>{key.applicationLink || '-'}</TableCell>
                    <TableCell>{key.videoTutorialLink || '-'}</TableCell>
                    <TableCell>
                      {key.isSold ? (
                        <StatusBadge sold>
                          <FaTimes /> Sold
                        </StatusBadge>
                      ) : (
                        <StatusBadge>
                          <FaCheck /> Available
                        </StatusBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!key.isSold && (
                        <ActionButton 
                          onClick={() => handleDeleteKey(key._id)}
                          danger
                        >
                          <FaTrash />
                        </ActionButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Section>
        
        <Section>
          <SectionTitle>Add New Keys</SectionTitle>
          
          {newKeys.map((keyData, index) => (
            <KeyInputGroup key={index}>
              <KeyInputField>
                <KeyInputLabel>Key</KeyInputLabel>
                <KeyInput
                  type="text"
                  value={keyData.key}
                  onChange={(e) => handleNewKeyChange(index, 'key', e.target.value)}
                  placeholder="Enter product key"
                  required
                />
              </KeyInputField>
              
              <KeyInputField>
                <KeyInputLabel>Application Link</KeyInputLabel>
                <KeyInput
                  type="text"
                  value={keyData.applicationLink}
                  onChange={(e) => handleNewKeyChange(index, 'applicationLink', e.target.value)}
                  placeholder="Enter application process link (optional)"
                />
              </KeyInputField>
              
              <KeyInputField>
                <KeyInputLabel>Video Tutorial Link</KeyInputLabel>
                <KeyInput
                  type="text"
                  value={keyData.videoTutorialLink}
                  onChange={(e) => handleNewKeyChange(index, 'videoTutorialLink', e.target.value)}
                  placeholder="Enter video tutorial link (optional)"
                />
              </KeyInputField>
              
              <KeyInputActions>
                {newKeys.length > 1 && (
                  <ActionButton 
                    onClick={() => removeNewKeyField(index)}
                    danger
                    type="button"
                  >
                    <FaTrash />
                  </ActionButton>
                )}
              </KeyInputActions>
            </KeyInputGroup>
          ))}
          
          <KeyInputButtons>
            <ActionButton onClick={addNewKeyField} type="button">
              <FaPlus /> Add Another Key
            </ActionButton>
            
            <SubmitButton onClick={handleAddKeys} disabled={loading}>
              {loading ? 'Adding...' : 'Add Keys'}
            </SubmitButton>
          </KeyInputButtons>
        </Section>
      </div>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  padding: 2rem 0 4rem;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.75rem;
    margin-left: 1rem;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
`;

const ProductInfo = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const ProductInfoItem = styled.div``;

const ProductInfoLabel = styled.div`
  font-weight: 600;
  color: var(--light-text);
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
`;

const ProductInfoValue = styled.div`
  font-size: 1.1rem;
  color: var(--text-color);
`;

const Section = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  padding: 1.5rem;
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
  word-break: break-all;
  color: var(--text-color);
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${props => props.sold ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)'};
  color: ${props => props.sold ? 'var(--danger-color)' : 'var(--success-color)'};
  
  svg {
    margin-right: 0.25rem;
  }
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
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const KeyInputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const KeyInputField = styled.div``;

const KeyInputLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
`;

const KeyInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #333333;
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--hover-background);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const KeyInputActions = styled.div`
  display: flex;
  align-items: flex-end;
`;

const KeyInputButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--success-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: #27ae60;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 576px) {
    width: 100%;
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

const ErrorContainer = styled.div`
  padding: 4rem 0;
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
  padding: 2rem 0;
`;

const EmptyStateMessage = styled.p`
  color: var(--light-text);
`;

export default AdminProductKeysPage; 