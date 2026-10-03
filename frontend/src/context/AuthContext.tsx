import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getErrorMessage } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  quickDemoLogin: (role?: 'ADMIN' | 'USER') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('clouddoc-access-token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/users/me');
        setUser(res.data.data);
      } catch (err) {
        localStorage.removeItem('clouddoc-access-token');
        localStorage.removeItem('clouddoc-user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password: pass });
      const { user: loggedInUser, tokens } = res.data.data;
      localStorage.setItem('clouddoc-access-token', tokens.accessToken);
      localStorage.setItem('clouddoc-user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, fullName: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { email, password: pass, fullName });
      const { user: registeredUser, tokens } = res.data.data;
      localStorage.setItem('clouddoc-access-token', tokens.accessToken);
      localStorage.setItem('clouddoc-user', JSON.stringify(registeredUser));
      setUser(registeredUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('clouddoc-access-token');
    localStorage.removeItem('clouddoc-user');
    setUser(null);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const quickDemoLogin = async (role: 'ADMIN' | 'USER' = 'USER') => {
    const email = role === 'ADMIN' ? 'admin@clouddoc.ai' : 'demo@clouddoc.ai';
    await login(email, 'Password@1234');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
