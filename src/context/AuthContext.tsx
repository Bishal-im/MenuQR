"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSession, logout as apiLogout } from '@/services/authService';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: 'superadmin' | 'admin' | 'waiter' | 'customer';
  restaurantId?: string;
  restaurantName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: (role?: string) => Promise<void>;
  refreshUser: (role?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode; initialSession?: AuthUser | null }> = ({ 
  children, 
  initialSession = null 
}) => {
  const [user, setUser] = useState<AuthUser | null>(initialSession);
  const [loading, setLoading] = useState(!initialSession);

  const refreshUser = async (role?: string) => {
    // If we already have a session from the server, we don't need to fetch it again on mount
    // unless we want to force a refresh.
    if (initialSession && loading && !role) {
       setLoading(false);
       return;
    }

    setLoading(true);
    try {
      const session = await getSession(role);
      setUser(session as AuthUser | null);
    } catch (error) {
      console.error("Error fetching session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialSession) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [initialSession]);

  const logout = async (role?: string) => {
    await apiLogout(role);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
