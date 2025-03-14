import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaSave, FaUpload, FaImage } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminProductFormPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'esp-keys',
    publisher: '',
    platform: 'windows',
    featured: false,
    discount: 0,
    applicationProcess: '',
    downloadLink: '',
    videoTutorial: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, user, navigate]);
  
  // Fetch product data if in edit mode
  useEffect(() => {
    if (isEditMode && isAuthenticated && user && user.role === 'admin') {
      fetchProduct();
    }
  }, [isEditMode, isAuthenticated, user, id]);
  
  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get(`/api/admin/products/${id}`);
      
      if (res.data.success) {
        const product = res.data.product;
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          imageUrl: product.imageUrl || '',
          category: product.category || 'esp-keys',
          publisher: product.publisher || '',
          platform: product.platform || 'windows',
          featured: product.featured || false,
          discount: product.discount || 0,
          applicationProcess: product.applicationProcess || '',
          downloadLink: product.downloadLink || '',
          videoTutorial: product.videoTutorial || ''
        });
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear the imageUrl field since we're using a file upload
      setFormData({
        ...formData,
        imageUrl: ''
      });
    }
  };
  
  // Handle image URL input
  const handleImageUrlChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      imageUrl: value
    });
    
    // Clear file selection if URL is entered
    if (value) {
      setImageFile(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate form data
      if (!formData.name || !formData.description || !formData.price) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      if (!formData.imageUrl && !imageFile) {
        setError('Please provide an image URL or upload an image');
        setLoading(false);
        return;
      }
      
      if (!formData.publisher) {
        setError('Publisher is required');
        setLoading(false);
        return;
      }
      
      // Format data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseInt(formData.discount, 10)
      };
      
      // Handle image upload if a file is selected
      if (imageFile) {
        try {
          // Create a FormData object to send the file
          const formData = new FormData();
          formData.append('image', imageFile);
          
          // Upload the image to Cloudinary via our server endpoint
          const uploadResponse = await api.post('/api/uploads', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          if (uploadResponse.data.success) {
            // Set the Cloudinary URL in the product data
            productData.imageUrl = uploadResponse.data.imageUrl;
          } else {
            throw new Error('Image upload failed');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          setError(`Failed to upload image: ${uploadError.response?.data?.message || uploadError.message}`);
          setLoading(false);
          return;
        }
      }
      
      let res;
      
      try {
        if (isEditMode) {
          res = await api.put(`/api/admin/products/${id}`, productData);
        } else {
          res = await api.post('/api/admin/products', productData);
        }
        
        if (res.data.success) {
          navigate('/admin');
        }
      } catch (err) {
        console.error('Error saving product:', err);
        setError(`Failed to save product: ${err.response?.data?.message || err.message}`);
        throw err;
      }
    } catch (err) {
      console.error('Error in form submission:', err);
      if (!error) {
        setError(`An error occurred: ${err.message}`);
      }
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
  
  return (
    <PageContainer>
      <div className="container">
        <PageHeader>
          <BackButton as={Link} to="/admin">
            <FaArrowLeft /> Back to Admin Panel
          </BackButton>
          <h1>{isEditMode ? 'Edit Product' : 'Create New Product'}</h1>
        </PageHeader>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FormContainer>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel htmlFor="name">Product Name *</FormLabel>
              <FormInput
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="description">Description *</FormLabel>
              <FormTextarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
              />
            </FormGroup>
            
            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="price">Price (₹) *</FormLabel>
                <FormInput
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="discount">Discount (%)</FormLabel>
                <FormInput
                  type="number"
                  id="discount"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <FormLabel>Product Image</FormLabel>
              <ImageUploadContainer>
                <ImageUploadOptions>
                  <FormGroup>
                    <FormLabel htmlFor="imageUrl">Image URL</FormLabel>
                    <FormInput
                      type="text"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleImageUrlChange}
                      placeholder="https://example.com/image.jpg"
                      disabled={!!imageFile}
                    />
                  </FormGroup>
                  
                  <OrDivider>OR</OrDivider>
                  
                  <UploadButtonContainer>
                    <HiddenFileInput 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <UploadButton type="button" onClick={triggerFileInput}>
                      <FaUpload /> Upload Image
                    </UploadButton>
                    {imageFile && (
                      <SelectedFileName>{imageFile.name}</SelectedFileName>
                    )}
                  </UploadButtonContainer>
                </ImageUploadOptions>
                
                <ImagePreviewContainer>
                  {(imagePreview || formData.imageUrl) ? (
                    <ImagePreview 
                      src={imagePreview || formData.imageUrl} 
                      alt="Product preview" 
                    />
                  ) : (
                    <ImagePlaceholder>
                      <FaImage />
                      <span>No image selected</span>
                    </ImagePlaceholder>
                  )}
                </ImagePreviewContainer>
              </ImageUploadContainer>
            </FormGroup>
            
            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="category">Category</FormLabel>
                <FormSelect
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="esp-keys">ESP Keys</option>
                  <option value="games">Games</option>
                  <option value="software">Software</option>
                  <option value="operating-systems">Operating Systems</option>
                </FormSelect>
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="platform">Platform</FormLabel>
                <FormSelect
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                >
                  <option value="windows">Windows</option>
                  <option value="mac">Mac</option>
                  <option value="linux">Linux</option>
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                  <option value="cross-platform">Cross Platform</option>
                </FormSelect>
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <FormLabel htmlFor="publisher">Publisher</FormLabel>
              <FormInput
                type="text"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="applicationProcess">Application Process URL</FormLabel>
              <FormInput
                type="text"
                id="applicationProcess"
                name="applicationProcess"
                value={formData.applicationProcess}
                onChange={handleChange}
                placeholder="https://example.com/application-process"
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="downloadLink">Download Link</FormLabel>
              <FormInput
                type="text"
                id="downloadLink"
                name="downloadLink"
                value={formData.downloadLink}
                onChange={handleChange}
                placeholder="https://example.com/download"
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="videoTutorial">Video Tutorial URL</FormLabel>
              <FormInput
                type="text"
                id="videoTutorial"
                name="videoTutorial"
                value={formData.videoTutorial}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=example"
              />
            </FormGroup>
            
            <FormGroup>
              <FormCheckboxLabel>
                <FormCheckbox
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                Featured Product
              </FormCheckboxLabel>
            </FormGroup>
            
            <FormActions>
              <SubmitButton type="submit" disabled={loading}>
                <FaSave /> {loading ? 'Saving...' : 'Save Product'}
              </SubmitButton>
              <CancelButton as={Link} to="/admin">
                Cancel
              </CancelButton>
            </FormActions>
          </Form>
        </FormContainer>
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
    color: var(--text-color);
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

const FormContainer = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div``;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
`;

const FormInput = styled.input`
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

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #333333;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  background-color: var(--hover-background);
  color: var(--text-color);
  
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
  background-color: var(--hover-background);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FormCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text-color);
`;

const FormCheckbox = styled.input`
  margin-right: 0.5rem;
  cursor: pointer;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
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
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover:not(:disabled) {
    background-color: #27ae60;
  }
  
  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const CancelButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: var(--light-text);
  border: 1px solid #333333;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 576px) {
    width: 100%;
    text-align: center;
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

const ImageUploadContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageUploadOptions = styled.div`
  display: flex;
  flex-direction: column;
`;

const OrDivider = styled.div`
  text-align: center;
  margin: 1rem 0;
  position: relative;
  color: var(--light-text);
  
  &:before, &:after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background-color: #333333;
  }
  
  &:before {
    left: 0;
  }
  
  &:after {
    right: 0;
  }
`;

const UploadButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const SelectedFileName = styled.div`
  font-size: 0.9rem;
  color: var(--light-text);
  word-break: break-all;
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--hover-background);
  border: 1px dashed #333333;
  border-radius: 4px;
  min-height: 200px;
  overflow: hidden;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
`;

const ImagePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--light-text);
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
`;

export default AdminProductFormPage; 