import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexastore_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('nexastore_token'));
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('nexastore_user', JSON.stringify(data.user));
      } catch {
        // Token invalid, clear
        setUser(null);
        setToken(null);
        localStorage.removeItem('nexastore_token');
        localStorage.removeItem('nexastore_user');
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const login = useCallback(async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('nexastore_token', data.token);
    localStorage.setItem('nexastore_user', JSON.stringify(data.user));
    return data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexastore_token');
    localStorage.removeItem('nexastore_user');
  }, []);

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    isAdmin,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
