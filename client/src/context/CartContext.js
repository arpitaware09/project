import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch cart from API if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load cart from localStorage if not authenticated
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart);
          setCart(parsedCart);
        } catch (err) {
          console.error('Error parsing cart from localStorage:', err);
          localStorage.removeItem('cart');
        }
      }
    }
  }, [isAuthenticated]);

  // Update totals whenever cart changes
  useEffect(() => {
    calculateTotals();
    
    // Save to localStorage if not authenticated
    if (!isAuthenticated && cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  // Calculate cart totals
  const calculateTotals = () => {
    const items = cart.reduce((total, item) => total + item.quantity, 0);
    setTotalItems(items);

    const price = cart.reduce((total, item) => {
      const itemPrice = item.product.discountedPrice || item.product.price;
      return total + (itemPrice * item.quantity);
    }, 0);
    setTotalPrice(price);
  };

  // Fetch cart from API
  const fetchCart = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/api/payments/cart');
      
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Add to server cart if authenticated
        const res = await api.post('/api/payments/cart', { productId, quantity });
        
        if (res.data.success) {
          setCart(res.data.cart);
          return true;
        }
      } else {
        // Add to local cart if not authenticated
        const existingItem = cart.find(item => item.product._id === productId);
        
        if (existingItem) {
          // Update quantity if item already in cart
          const updatedCart = cart.map(item => 
            item.product._id === productId 
              ? { ...item, quantity: item.quantity + quantity } 
              : item
          );
          setCart(updatedCart);
        } else {
          // Fetch product details and add to cart
          const res = await api.get(`/api/products/${productId}`);
          
          if (res.data.success) {
            const newItem = {
              product: res.data.product,
              quantity
            };
            setCart([...cart, newItem]);
          }
        }
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item to cart');
      console.error('Error adding to cart:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    setLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Remove from server cart if authenticated
        const res = await api.delete(`/api/payments/cart/${productId}`);
        
        if (res.data.success) {
          setCart(res.data.cart);
          return true;
        }
      } else {
        // Remove from local cart if not authenticated
        const updatedCart = cart.filter(item => item.product._id !== productId);
        setCart(updatedCart);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item from cart');
      console.error('Error removing from cart:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    setError(null);

    try {
      if (quantity <= 0) {
        return removeFromCart(productId);
      }

      if (isAuthenticated) {
        // First remove the item
        await api.delete(`/api/payments/cart/${productId}`);
        
        // Then add it back with the new quantity
        const res = await api.post('/api/payments/cart', { productId, quantity });
        
        if (res.data.success) {
          setCart(res.data.cart);
          return true;
        }
      } else {
        // Update local cart if not authenticated
        const updatedCart = cart.map(item => 
          item.product._id === productId 
            ? { ...item, quantity } 
            : item
        );
        setCart(updatedCart);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity');
      console.error('Error updating quantity:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Clear server cart by removing each item
        for (const item of cart) {
          await api.delete(`/api/payments/cart/${item.product._id}`);
        }
      }
      
      // Clear local cart
      setCart([]);
      localStorage.removeItem('cart');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear cart');
      console.error('Error clearing cart:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sync local cart with server after login
  const syncCartAfterLogin = async () => {
    if (!isAuthenticated || cart.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Add each local cart item to server cart
      for (const item of cart) {
        await api.post('/api/payments/cart', {
          productId: item.product._id,
          quantity: item.quantity
        });
      }

      // Clear local cart
      localStorage.removeItem('cart');
      
      // Fetch updated cart from server
      await fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync cart');
      console.error('Error syncing cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCartAfterLogin,
        clearError
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 