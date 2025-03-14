import React from 'react';
import styled from 'styled-components';
import { FaExchangeAlt } from 'react-icons/fa';
import { useCurrency } from '../../context/CurrencyContext';

const CurrencyToggle = () => {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <ToggleButton onClick={toggleCurrency}>
      <FaExchangeAlt />
      <span>{currency === 'INR' ? '₹ INR' : '$ USD'}</span>
    </ToggleButton>
  );
};

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--text-color);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  svg {
    margin-right: 0.5rem;
    font-size: 0.8rem;
  }
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
`;

export default CurrencyToggle; 