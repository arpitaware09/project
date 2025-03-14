import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      
      const success = await register(registerData);
      
      if (success) {
        navigate('/');
      }
      
      setIsSubmitting(false);
    }
  };
  
  return (
    <RegisterContainer>
      <div className="container">
        <RegisterCard>
          <RegisterHeader>
            <h2>Create an Account</h2>
            <p>Fill in your details to register</p>
          </RegisterHeader>
          
          {error && <ErrorAlert>{error}</ErrorAlert>}
          
          <RegisterForm onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Full Name</Label>
              <InputWrapper>
                <InputIcon>
                  <FaUser />
                </InputIcon>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={formErrors.name ? 'error' : ''}
                />
              </InputWrapper>
              {formErrors.name && <ErrorMessage>{formErrors.name}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <InputWrapper>
                <InputIcon>
                  <FaEnvelope />
                </InputIcon>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? 'error' : ''}
                />
              </InputWrapper>
              {formErrors.email && <ErrorMessage>{formErrors.email}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <InputWrapper>
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className={formErrors.password ? 'error' : ''}
                />
              </InputWrapper>
              {formErrors.password && <ErrorMessage>{formErrors.password}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <InputWrapper>
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={formErrors.confirmPassword ? 'error' : ''}
                />
              </InputWrapper>
              {formErrors.confirmPassword && <ErrorMessage>{formErrors.confirmPassword}</ErrorMessage>}
            </FormGroup>
            
            <TermsText>
              By registering, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
            </TermsText>
            
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : (
                <>
                  <FaUserPlus /> Register
                </>
              )}
            </SubmitButton>
          </RegisterForm>
          
          <RegisterFooter>
            <p>Already have an account? <LoginLink to="/login">Login</LoginLink></p>
          </RegisterFooter>
        </RegisterCard>
      </div>
    </RegisterContainer>
  );
};

const RegisterContainer = styled.div`
  padding: 4rem 0;
  background-color: var(--background-color);
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
`;

const RegisterCard = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  padding: 2rem;
  max-width: 500px;
  margin: 0 auto;
`;

const RegisterHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }
  
  p {
    color: var(--light-text);
  }
`;

const RegisterForm = styled.form`
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--light-text);
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--light-text);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #333333;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background-color: #222222;
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  &.error {
    border-color: var(--danger-color);
  }
`;

const ErrorMessage = styled.div`
  color: var(--danger-color);
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const ErrorAlert = styled.div`
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--danger-color);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const TermsText = styled.p`
  font-size: 0.85rem;
  color: var(--light-text);
  margin-bottom: 1.5rem;
  
  a {
    color: var(--primary-color);
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
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
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const RegisterFooter = styled.div`
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
  
  p {
    color: #666;
  }
`;

const LoginLink = styled(Link)`
  color: var(--primary-color);
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default RegisterPage; 