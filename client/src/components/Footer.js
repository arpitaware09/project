import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background-color: #000000;
  color: #b3b3b3;
  padding: 2rem 0;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
`;

const FooterSection = styled.div`
  h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: #e50914;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 0.5rem;
  }

  a {
    color: #b3b3b3;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #ffffff;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  a {
    color: #b3b3b3;
    font-size: 1.5rem;
    transition: color 0.3s ease;

    &:hover {
      color: #e50914;
    }
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #333333;
  font-size: 0.9rem;
  color: #737373;
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>Qucik Axis</h3>
          <p>Your one-stop shop for digital product keys and software licenses.</p>
          <SocialLinks>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/profile">My Account</Link></li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h3>Categories</h3>
          <ul>
            <li><Link to="/?category=software">Software</Link></li>
            <li><Link to="/?category=games">Games</Link></li>
            <li><Link to="/?category=operating-systems">Operating Systems</Link></li>
            <li><Link to="/?category=antivirus">Antivirus</Link></li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h3>Help & Support</h3>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </FooterSection>
      </FooterContent>

      <Copyright>
        &copy; {currentYear} Quick Axis. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer; 