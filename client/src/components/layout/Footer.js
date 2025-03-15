import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaFacebook, FaDiscord, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <div className="container">
        <FooterContent>
          <FooterSection>
            <h3>Quick Axis</h3>
            <p>Your trusted source for digital product keys and software licenses.</p>
            <SocialIcons>
              <SocialIcon href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </SocialIcon>
              <SocialIcon href="https://discord.com" target="_blank" rel="noopener noreferrer">
                <FaDiscord />
              </SocialIcon>
              <SocialIcon href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </SocialIcon>
              <SocialIcon href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </SocialIcon>
            </SocialIcons>
          </FooterSection>

          <FooterSection>
            <h3>Quick Links</h3>
            <FooterLinks>
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/products">Products</FooterLink>
              <FooterLink to="/cart">Cart</FooterLink>
              <FooterLink to="/profile">My Account</FooterLink>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h3>Categories</h3>
            <FooterLinks>
              <FooterLink to="/products?category=esp-keys">ESP Keys</FooterLink>
              <FooterLink to="/products?category=games">Games</FooterLink>
              <FooterLink to="/products?category=software">Software</FooterLink>
              <FooterLink to="/products?category=operating-systems">Operating Systems</FooterLink>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h3>Contact Us</h3>
            <ContactInfo>
              <p>Email: support@quickaxis.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Hours: Mon-Fri, 9am-5pm EST</p>
            </ContactInfo>
          </FooterSection>
        </FooterContent>

        <FooterBottom>
          <p>&copy; {currentYear} Quick Axis. All rights reserved.</p>
          <FooterBottomLinks>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
            <FooterLink to="/terms">Terms of Service</FooterLink>
          </FooterBottomLinks>
        </FooterBottom>
      </div>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background-color: var(--dark-color);
  color: white;
  padding: 3rem 0 1.5rem;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FooterSection = styled.div`
  h3 {
    font-size: 1.2rem;
    margin-bottom: 1.25rem;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -8px;
      width: 40px;
      height: 2px;
      background-color: var(--primary-color);
    }
  }
  
  p {
    margin-bottom: 1rem;
    color: #ccc;
    line-height: 1.6;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterLink = styled(Link)`
  color: #ccc;
  text-decoration: none;
  margin-bottom: 0.75rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const SocialIcons = styled.div`
  display: flex;
  margin-top: 1rem;
`;

const SocialIcon = styled.a`
  color: white;
  font-size: 1.25rem;
  margin-right: 1rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ContactInfo = styled.div`
  p {
    margin-bottom: 0.5rem;
  }
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  p {
    color: #ccc;
    font-size: 0.9rem;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    
    p {
      margin-bottom: 1rem;
    }
  }
`;

const FooterBottomLinks = styled.div`
  display: flex;
  
  a {
    margin-left: 1.5rem;
    font-size: 0.9rem;
    
    @media (max-width: 768px) {
      margin: 0 0.75rem;
    }
  }
`;

export default Footer; 