import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and load user profile
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getMe();
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth init failed:', err);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('token', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    localStorage.setItem('token', res.token);
    if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  }, []);

  const registerDoctor = useCallback(async (data) => {
    const res = await authService.registerDoctor(data);
    localStorage.setItem('token', res.token);
    if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    } catch (err) {
      console.error('Server logout request failed:', err);
    }
    authService.logout();
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  }, []);

  const isProfileComplete = useCallback(() => {
    if (!user) return false;
    if (user.role !== 'patient') return true;
    const profile = user.profile;
    if (!profile) return false;
    return (
      profile.age !== null &&
      profile.age !== undefined &&
      profile.age !== '' &&
      profile.gender !== null &&
      profile.gender !== undefined &&
      profile.gender !== ''
    );
  }, [user]);

  const value = { 
    user, 
    loading, 
    login, 
    register, 
    registerDoctor,
    logout, 
    refreshUser,
    isAuthenticated: !!user,
    role: user?.role || null,
    isProfileComplete
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
