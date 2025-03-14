import React, { createContext, useState, useContext, useEffect } from 'react';

// Exchange rates (in a real app, you would fetch these from an API)
const EXCHANGE_RATES = {
  USD_TO_INR: 83.5, // 1 USD = 83.5 INR (approximate)
  INR_TO_USD: 1 / 83.5, // 1 INR = 0.012 USD (approximate)
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('INR'); // Default to INR (base currency)

  // Load saved currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Toggle between INR and USD
  const toggleCurrency = () => {
    const newCurrency = currency === 'INR' ? 'USD' : 'INR';
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  // Format price based on selected display currency
  // IMPORTANT: All prices in the system are stored in INR (base currency)
  // This function only converts for display purposes
  const formatPrice = (priceInINR) => {
    if (!priceInINR && priceInINR !== 0) return '';
    
    let displayPrice;
    
    if (currency === 'USD') {
      // Convert from INR to USD for display
      displayPrice = priceInINR * EXCHANGE_RATES.INR_TO_USD;
    } else {
      // Already in INR, no conversion needed
      displayPrice = priceInINR;
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(displayPrice);
  };

  // Convert a USD amount to INR (for admin input)
  const convertUSDtoINR = (amountInUSD) => {
    return amountInUSD * EXCHANGE_RATES.USD_TO_INR;
  };

  // Get the raw price in the current display currency (without formatting)
  const getPriceInDisplayCurrency = (priceInINR) => {
    if (currency === 'USD') {
      return priceInINR * EXCHANGE_RATES.INR_TO_USD;
    }
    return priceInINR;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      toggleCurrency, 
      formatPrice,
      convertUSDtoINR,
      getPriceInDisplayCurrency,
      exchangeRate: EXCHANGE_RATES
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);

export default CurrencyContext; 