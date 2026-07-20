import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  login: (credentials: any) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchMe = async () => {
    try {
      setAuthLoading(true);
      const data = await apiFetch('/api/auth/me');
      if (data && data._id) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (credentials: any) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setUser(data);
  };

  const signup = async (userData: any) => {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    setUser(data);
  };

  const logout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, signup, logout, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
