import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage and verify token
  useEffect(() => {
    const initializeAuth = async () => {
      const tkn = localStorage.getItem('token');
      const usr = localStorage.getItem('user');
      
      if (tkn && usr) {
        try {
          // Verify token is still valid by calling verify endpoint
          const response = await api.get('/auth/verify');
          if (response.data.user) {
            setToken(tkn);
            setUser(response.data.user);
            // Update stored user data in case it changed
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (err) {
          // Token invalid or expired, clear storage
          console.log('Token verification failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = async () => {
    try {
      // Call logout endpoint (optional, for server-side session tracking if needed)
      const token = localStorage.getItem('token');
      if (token) {
        // Use api service if available, but don't block logout on error
        try {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (err) {
          // Ignore logout API errors - client-side logout is sufficient for JWT
          console.log('Logout API call failed (non-critical):', err);
        }
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear client-side state
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
