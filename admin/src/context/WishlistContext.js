import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchWishlistIds = useCallback(async () => {
    if (!isLoggedIn) { setWishlistIds(new Set()); setWishlistCount(0); return; }
    try {
      const res = await wishlistAPI.getIds();
      const ids = res.data.ids || [];
      setWishlistIds(new Set(ids));
      setWishlistCount(ids.length);
    } catch {}
  }, [isLoggedIn]);

  useEffect(() => { fetchWishlistIds(); }, [fetchWishlistIds]);

  const toggleWishlist = async (productId) => {
    if (!isLoggedIn) return false;
    try {
      if (wishlistIds.has(productId)) {
        await wishlistAPI.remove(productId);
        setWishlistIds(prev => { const s = new Set(prev); s.delete(productId); return s; });
        setWishlistCount(c => c - 1);
        return false; // removed
      } else {
        await wishlistAPI.add(productId);
        setWishlistIds(prev => new Set([...prev, productId]));
        setWishlistCount(c => c + 1);
        return true; // added
      }
    } catch { return null; }
  };

  const isWishlisted = (productId) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistCount, toggleWishlist, isWishlisted, fetchWishlistIds }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
