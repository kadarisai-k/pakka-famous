import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// ── Access token: stored in JS memory only (not localStorage — XSS safe) ────
let memoryToken = null;

export const getMemoryToken  = ()  => memoryToken;
export const setMemoryToken  = (t) => { memoryToken = t; };
export const clearMemoryToken = () => { memoryToken = null; };

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // Decode JWT expiry without a library
  const getTokenExpiry = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])).exp * 1000; }
    catch { return null; }
  };

  // Schedule silent token refresh 1 minute before expiry
  const scheduleRefresh = useCallback((token) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const expiry = getTokenExpiry(token);
    if (!expiry) return;
    const delay = expiry - Date.now() - 60_000;
    if (delay <= 0) { silentRefresh(); return; }
    refreshTimerRef.current = setTimeout(silentRefresh, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const silentRefresh = useCallback(async () => {
    try {
      const res = await authAPI.refresh();
      const { token } = res.data;
      setMemoryToken(token);
      scheduleRefresh(token);
    } catch {
      // Refresh failed — clear session silently
      clearMemoryToken();
      sessionStorage.removeItem('pakka_user');
      setUser(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleRefresh]);

  // On mount: restore session using httpOnly refresh cookie
  useEffect(() => {
    const restoreSession = async () => {
      const saved = sessionStorage.getItem('pakka_user');
      if (saved) {
        try {
          const res = await authAPI.refresh();
          const { token } = res.data;
          setMemoryToken(token);
          setUser(JSON.parse(saved));
          scheduleRefresh(token);
        } catch {
          sessionStorage.removeItem('pakka_user');
        }
      }
      setLoading(false);
    };
    restoreSession();
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((userData, token) => {
    setMemoryToken(token);
    // sessionStorage: tab-scoped, holds only non-sensitive user info — NOT the token
    sessionStorage.setItem('pakka_user', JSON.stringify(userData));
    setUser(userData);
    scheduleRefresh(token);
  }, [scheduleRefresh]);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore network errors */ }
    clearMemoryToken();
    sessionStorage.removeItem('pakka_user');
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    sessionStorage.setItem('pakka_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, updateUser,
      isAdmin:   user?.role === 'admin',
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
