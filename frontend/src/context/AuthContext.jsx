import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token and user in localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    let parsedUser = null;
    
    try {
      if (userData && userData !== 'undefined') {
        parsedUser = JSON.parse(userData);
      }
    } catch (e) {
      localStorage.removeItem('user');
    }
    
    if (token && parsedUser) {
      // Set user immediately, let axios interceptors handle token validation
      setUser({ ...parsedUser, token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    try {
      console.log('Attempting login to:', `${API_BASE}/login`);
      
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Login successful');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser({ ...data.user, token: data.token });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Network error - please check your connection');
    }
  };



  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('settings');
    setUser(null);
    // Remove dark mode class from body and root div
    document.body.classList.remove('dark-mode');
    const rootDiv = document.getElementById('root');
    if (rootDiv) rootDiv.classList.remove('dark-mode');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 