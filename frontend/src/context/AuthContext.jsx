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
      setUser({ ...parsedUser, token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser({ ...data.user, token: data.token });
      return true;
    } catch (error) {
      throw new Error(error.message);
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