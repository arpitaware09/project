import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CurrencyToggle from './CurrencyToggle';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <HeaderContainer>
      <div className="container">
        <HeaderContent>
          <Logo>
            <Link to="/">Qucik Axis</Link>
          </Logo>

          <MobileMenuButton onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </MobileMenuButton>

          <Nav isOpen={isMenuOpen}>
            <NavList>
              <NavItem>
                <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/products" onClick={() => setIsMenuOpen(false)}>Products</NavLink>
              </NavItem>
              <NavItem>
                <CurrencyToggle />
              </NavItem>
            </NavList>

            <NavList>
              <NavItem>
                <NavLink to="/cart" onClick={() => setIsMenuOpen(false)}>
                  <FaShoppingCart />
                  <CartCount>{totalItems}</CartCount>
                </NavLink>
              </NavItem>
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <NavItem>
                      <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}>
                        Admin Panel
                      </NavLink>
                    </NavItem>
                  )}
                  <NavItem>
                    <NavLink to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <FaUser />
                      <span className="ml-1">{user?.name?.split(' ')[0]}</span>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <LogoutButton onClick={handleLogout}>
                      <FaSignOutAlt />
                      <span className="ml-1">Logout</span>
                    </LogoutButton>
                  </NavItem>
                </>
              ) : (
                <>
                  <NavItem>
                    <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink to="/register" onClick={() => setIsMenuOpen(false)}>Register</NavLink>
                  </NavItem>
                </>
              )}
            </NavList>
          </Nav>
        </HeaderContent>
      </div>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  background-color: var(--dark-color);
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  
  a {
    color: white;
    text-decoration: none;
    
    &:hover {
      color: var(--primary-color);
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background-color: var(--dark-color);
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    transform: ${({ isOpen }) => isOpen ? 'translateY(0)' : 'translateY(-100%)'};
    opacity: ${({ isOpen }) => isOpen ? '1' : '0'};
    visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
    transition: all 0.3s ease-in-out;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 99;
  }
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  
  &:first-child {
    margin-right: 2rem;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    
    &:first-child {
      margin-right: 0;
      margin-bottom: 1rem;
    }
  }
`;

const NavItem = styled.li`
  margin: 0 0.5rem;
  
  @media (max-width: 768px) {
    margin: 0.5rem 0;
    width: 100%;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  
  &:hover {
    color: var(--primary-color);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.75rem 0;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  font-size: 1rem;
  
  &:hover {
    color: var(--primary-color);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.75rem 0;
    text-align: left;
  }
`;

const CartCount = styled.span`
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  margin-left: 5px;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

export default Header; 