'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/apiClient';

export interface UserProfile {
  id: string | number;
  full_name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'user' | 'customer';
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: { phoneOrEmail: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (idToken: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: { full_name: string; phone: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMe = async (currentToken?: string) => {
    try {
      // If we don't pass a token, use the state one. But apiClient usually intercepts using localStorage anyway.
      const res: any = await apiClient.get('/auth/me');
      if (res?.user) {
        const u: UserProfile = {
          id: res.user._id || res.user.id || res.user.customer_id,
          full_name: res.user.full_name || res.user.name || 'Khách hàng',
          email: res.user.email,
          phone: res.user.phone,
          role: res.user.role || (res.user.type === 'customer' ? 'user' : 'admin'),
          avatar: res.user.avatar_url || res.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.user.full_name || res.user.name || 'U')}&background=e2e8f0&color=475569`,
        };
        setUser(u);
        localStorage.setItem('closet_user', JSON.stringify(u));
      }
    } catch (error) {
      console.warn('Failed to fetch user profile, clearing session', error);
      logout();
    }
  };

  // Initialize Auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('closet_token');
        const savedUser = localStorage.getItem('closet_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // Refresh user data silently
          await fetchMe(savedToken);
        }
      } catch (e) {
        console.warn('Failed to load auth state from localStorage', e);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials: { phoneOrEmail: string; password: string }) => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.post('/auth/user/login', {
        phone: credentials.phoneOrEmail,
        password: credentials.password,
      });

      if (res?.token && res?.user) {
        const u: UserProfile = {
          id: res.user._id || res.user.id || res.user.customer_id,
          full_name: res.user.full_name || res.user.name || 'Khách hàng',
          email: res.user.email,
          phone: res.user.phone || credentials.phoneOrEmail,
          role: res.user.role || (res.user.type === 'customer' ? 'user' : 'admin'),
          avatar: res.user.avatar_url || res.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.user.full_name || res.user.name || 'U')}&background=e2e8f0&color=475569`,
        };

        setToken(res.token);
        setUser(u);
        localStorage.setItem('closet_token', res.token);
        localStorage.setItem('closet_user', JSON.stringify(u));
        return { success: true };
      }
      return { success: false, message: 'Đăng nhập thất bại. Không nhận được token.' };
    } catch (err: any) {
      console.error('Auth login error:', err);
      return { success: false, message: err?.response?.data?.message || err.message || 'Đăng nhập thất bại' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { full_name: string; phone: string; password: string }) => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.post('/auth/user/register', {
        name: userData.full_name,
        phone: userData.phone,
        password: userData.password
      });
      // Try to login directly with the returned token if applicable, or just call login
      if (res?.token) {
         return await login({ phoneOrEmail: userData.phone, password: userData.password });
      }
      return { success: true, message: 'Đăng ký thành công' };
    } catch (err: any) {
      console.error('Auth register error:', err);
      return { success: false, message: err?.response?.data?.message || err.message || 'Đăng ký thất bại' };
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.post('/auth/google-login', { idToken });
      
      if (res?.token && res?.user) {
        const u: UserProfile = {
          id: res.user._id || res.user.id || res.user.customer_id,
          full_name: res.user.full_name || res.user.name || 'Khách hàng',
          email: res.user.email,
          phone: res.user.phone,
          role: res.user.role || (res.user.type === 'customer' ? 'user' : 'admin'),
          avatar: res.user.avatar_url || res.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.user.full_name || res.user.name || 'U')}&background=e2e8f0&color=475569`,
        };

        setToken(res.token);
        setUser(u);
        localStorage.setItem('closet_token', res.token);
        localStorage.setItem('closet_user', JSON.stringify(u));
        return { success: true };
      }
      return { success: false, message: 'Đăng nhập Google thất bại. Không nhận được token.' };
    } catch (err: any) {
      console.error('Google login error:', err);
      return { success: false, message: err?.response?.data?.message || err.message || 'Đăng nhập Google thất bại' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('closet_token');
    localStorage.removeItem('closet_user');
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        googleLogin,
        register,
        logout,
        fetchMe,
      }}
    >
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
