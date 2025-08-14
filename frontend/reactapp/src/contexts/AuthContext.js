import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser(payload);
        setToken(storedToken);
        
        // Store contact details
        if (payload.email && payload.mobile) {
          localStorage.setItem('userContact', JSON.stringify({
            email: payload.email,
            mobile: payload.mobile
          }));
        }
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('userContact');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      
      setUser(payload);
      setToken(data.token);

      localStorage.setItem('userContact', JSON.stringify({
        email: payload.email,
        mobile: payload.mobile
      }));

      return { success: true, user: payload };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('token', data.token);
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      
      setUser(payload);
      setToken(data.token);

      localStorage.setItem('userContact', JSON.stringify({
        email: payload.email,
        mobile: payload.mobile
      }));

      return { success: true, user: payload };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userContact');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin'
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};