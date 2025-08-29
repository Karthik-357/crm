// Authentication utility functions

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('settings');
};

export const handleAuthError = (error, logout) => {
  if (error.response?.status === 401) {
    console.log('Authentication error detected');
    clearAuthData();
    logout();
    window.location.href = '/login';
    return true;
  }
  return false;
};
