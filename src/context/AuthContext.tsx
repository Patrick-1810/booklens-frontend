import React, { useState, useEffect, useCallback } from 'react';
import { api, authStorage } from '../services/api';
import type { User, AuthResponse, UserMeResponse, LoginCredentials, RegisterCredentials } from '../types/auth';
import { AuthContext, type AuthContextType } from './auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authStorage.getUser<User>());
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    authStorage.clearAuth();
    setUser(null);
  }, []);

  const refreshUserProfile = useCallback(async () => {
    try {
      const response = await api.get<UserMeResponse>('/auth/me');
      if (response.data?.usuario) {
        setUser(response.data.usuario);
        authStorage.setUser(response.data.usuario);
      }
    } catch {
      // Se falhar e os tokens forem inválidos, a limpeza é acionada
    }
  }, []);

  useEffect(() => {
    const handleGlobalLogout = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleGlobalLogout);

    const initializeAuth = async () => {
      const token = authStorage.getAccessToken();
      if (token) {
        await refreshUserProfile();
      } else {
        authStorage.clearAuth();
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();

    return () => {
      window.removeEventListener('auth:logout', handleGlobalLogout);
    };
  }, [logout, refreshUserProfile]);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const data = response.data;

    authStorage.setAuth(data.access_token, data.refresh_token, data.usuario);
    setUser(data.usuario);

    return data;
  };

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    const data = response.data;

    if (data.access_token && data.refresh_token) {
      authStorage.setAuth(data.access_token, data.refresh_token, data.usuario);
      setUser(data.usuario);
    }

    return data;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
