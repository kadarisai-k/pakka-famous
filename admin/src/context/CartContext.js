import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const { isLoggedIn, isAdmin } = useAuth();

  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      fetchCart();
    } else {
      setCart(null);
      setCartCount(0);
    }
  }, [isLoggedIn, isAdmin]);

  const fetchCart = async () => {
    try {
      const res = await cartAPI.get();
      setCart(res.data.cart);
      setCartCount(res.data.cart.items.length);
    } catch (error) {
      console.error('Cart fetch error:', error);
    }
  };

  const addToCart = async (productId, quantity = 1, weight) => {
    try {
      const res = await cartAPI.add({ productId, quantity, weight });
      setCart(res.data.cart);
      setCartCount(res.data.cart.items.length);
      // NOTE: Toast is shown by the caller (ProductCard) — do NOT show toast here
    } catch (error) {
      throw error; // re-throw so caller can handle
    }
  };

  const updateQuantity = async (productId, quantity, weight) => {
    try {
      const res = await cartAPI.update({ productId, quantity, weight });
      setCart(res.data.cart);
      setCartCount(res.data.cart.items.length);
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (productId, weight) => {
    try {
      const res = await cartAPI.remove(productId, weight);
      setCart(res.data.cart);
      setCartCount(res.data.cart.items.length);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart({ items: [], totalAmount: 0 });
      setCartCount(0);
    } catch (error) {
      console.error('Clear cart error:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
