import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// Access token lives in JS memory only (XSS-safe — never in localStorage)
let memoryToken = null;
export const getMemoryToken   = ()  => memoryToken;
export const setMemoryToken   = (t) => { memoryToken = t; };
export const clearMemoryToken = ()  => { memoryToken = null; };

const LS_KEY = 'pakka_admin_session'; // localStorage — persists across tabs & refreshes

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef(null);

  const decodeExpiry = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])).exp * 1000; }
    catch { return null; }
  };

  // ── silent token refresh, called automatically before expiry ──────
  const doRefresh = useCallback(async () => {
    try {
      const res = await authAPI.refresh();
      const { token } = res.data;
      setMemoryToken(token);
      scheduleNext(token);
      // Bump the stored timestamp so we know session is still alive
      try {
        const prev = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
        localStorage.setItem(LS_KEY, JSON.stringify({ ...prev, ts: Date.now() }));
      } catch (_) {}
    } catch {
      // httpOnly refresh cookie expired (> 7 days idle) — force re-login
      clearMemoryToken();
      localStorage.removeItem(LS_KEY);
      setUser(null);
    }
  }, []); // eslint-disable-line

  // Schedule next refresh 90 s before the access-token expires
  const scheduleNext = useCallback((token) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    const exp = decodeExpiry(token);
    if (!exp) return;
    const delay = Math.max(0, exp - Date.now() - 90_000);
    refreshTimer.current = setTimeout(doRefresh, delay);
  }, [doRefresh]);

  // On tab focus: if memory token is gone / expired, re-fetch silently
  useEffect(() => {
    const onFocus = async () => {
      if (!user) return;
      const exp = memoryToken ? decodeExpiry(memoryToken) : 0;
      if (!exp || Date.now() >= exp - 30_000) await doRefresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') onFocus();
    });
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [user, doRefresh]);

  // On mount: restore from localStorage + re-issue access token via refresh cookie
  useEffect(() => {
    (async () => {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        try {
          const { user: savedUser } = JSON.parse(raw);
          // The httpOnly refresh cookie is sent automatically — no explicit token needed
          const res = await authAPI.refresh();
          const { token } = res.data;
          setMemoryToken(token);
          setUser(savedUser);
          scheduleNext(token);
          localStorage.setItem(LS_KEY, JSON.stringify({ user: savedUser, ts: Date.now() }));
        } catch {
          // Refresh cookie expired → clean up and show login
          localStorage.removeItem(LS_KEY);
        }
      }
      setLoading(false);
    })();
    return () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); };
  }, []); // eslint-disable-line

  const login = useCallback((userData, token) => {
    setMemoryToken(token);
    localStorage.setItem(LS_KEY, JSON.stringify({ user: userData, ts: Date.now() }));
    setUser(userData);
    scheduleNext(token);
  }, [scheduleNext]);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch (_) {}
    clearMemoryToken();
    localStorage.removeItem(LS_KEY);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    try {
      const prev = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      localStorage.setItem(LS_KEY, JSON.stringify({ ...prev, user: userData, ts: Date.now() }));
    } catch (_) {}
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAdmin: user?.role === 'admin', isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
