import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Immediately fetch the active profile matching the token
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (err) {
          // Strip failing tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    
    // Explicitly set the robust user payload containing picture, bio, stats
    try {
      const profileRes = await api.get('/auth/profile');
      setUser(profileRes.data);
    } catch (e) {
      setUser(response.data.user);
    }
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch(err) {} // ignore any failure during logout
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
        {children}
    </AuthContext.Provider>
  )
}
