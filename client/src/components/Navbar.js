import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NavbarContainer = styled.nav`
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 1rem 0;
    z-index: 10;
  }
`;

const NavLink = styled(Link)`
  margin-left: 1.5rem;
  color: var(--text-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  
  &:hover {
    color: var(--primary-color);
  }

  @media (max-width: 768px) {
    margin: 0.5rem 0;
  }
`;

const CartBadge = styled.span`
  background-color: var(--accent-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  top: -8px;
  right: 5px;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color);

  @media (max-width: 768px) {
    display: block;
  }
`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <NavbarContainer>
      <NavContent>
        <Logo to="/">Digital Keys</Logo>

        <MobileMenuButton onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </MobileMenuButton>

        <NavLinks isOpen={isOpen}>
          <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
          
          <NavLink to="/cart" onClick={() => setIsOpen(false)}>
            <FaShoppingCart />
            {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/profile" onClick={() => setIsOpen(false)}>
                <FaUser style={{ marginRight: '5px' }} />
                {user?.name}
              </NavLink>
              <NavLink to="#" onClick={() => { handleLogout(); setIsOpen(false); }}>
                <FaSignOutAlt style={{ marginRight: '5px' }} />
                Logout
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setIsOpen(false)}>Login</NavLink>
              <NavLink to="/register" onClick={() => setIsOpen(false)}>Register</NavLink>
            </>
          )}
        </NavLinks>
      </NavContent>
    </NavbarContainer>
  );
};

export default Navbar; 