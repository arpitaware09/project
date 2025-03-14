import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, error, clearError } = useAuth();
  const { syncCartAfterLogin } = useCart();
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
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      const success = await login(formData);
      
      if (success) {
        // Sync local cart with server cart
        await syncCartAfterLogin();
        navigate('/');
      }
      
      setIsSubmitting(false);
    }
  };
  
  return (
    <LoginContainer>
      <div className="container">
        <LoginCard>
          <LoginHeader>
            <h2>Login to Your Account</h2>
            <p>Enter your credentials to access your account</p>
          </LoginHeader>
          
          {error && <ErrorAlert>{error}</ErrorAlert>}
          
          <LoginForm onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <InputWrapper>
                <InputIcon>
                  <FaUser />
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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={formErrors.password ? 'error' : ''}
                />
              </InputWrapper>
              {formErrors.password && <ErrorMessage>{formErrors.password}</ErrorMessage>}
            </FormGroup>
            
            <ForgotPassword to="/forgot-password">Forgot password?</ForgotPassword>
            
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : (
                <>
                  <FaSignInAlt /> Login
                </>
              )}
            </SubmitButton>
          </LoginForm>
          
          <LoginFooter>
            <p>Don't have an account? <RegisterLink to="/register">Register</RegisterLink></p>
          </LoginFooter>
        </LoginCard>
      </div>
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  padding: 4rem 0;
  background-color: var(--light-color);
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
`;

const LoginCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 500px;
  margin: 0 auto;
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
  }
`;

const LoginForm = styled.form`
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
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

const ForgotPassword = styled(Link)`
  display: block;
  text-align: right;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  
  &:hover {
    text-decoration: underline;
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

const LoginFooter = styled.div`
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
  
  p {
    color: #666;
  }
`;

const RegisterLink = styled(Link)`
  color: var(--primary-color);
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default LoginPage; 