"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

interface AuthProviderProps {
  children: ReactNode;
  initialSession: AuthUser | null;
  role?: string; // The role expected for this context instance (from URL)
}

export const AuthProvider = ({ children, initialSession, role }: AuthProviderProps) => {
  // Only use initialSession if it matches the expected role for this panel
  const filteredInitialSession = (initialSession && role && initialSession.role === role) 
    ? initialSession 
    : (initialSession && !role) ? initialSession : null;

  const [user, setUser] = useState<AuthUser | null>(filteredInitialSession);
  const [loading, setLoading] = useState(!filteredInitialSession);

  const refreshUser = async (requestedRole?: string) => {
    // If we're refreshing, use the specific requested role or the one from props
    const targetRole = requestedRole || role;

    setLoading(true);
    try {
      const url = targetRole ? `/api/auth/session?role=${targetRole}` : `/api/auth/session`;
      const response = await fetch(url, { credentials: 'include' });
      
      if (response.ok) {
        const data = await response.json();
        // Only set user if the returned session matches the role we care about (if any)
        if (data.session) {
           if (!targetRole || data.session.role === targetRole) {
             setUser(data.session as AuthUser);
           } else {
             // If session exists but doesn't match the target role, clear user for this context
             setUser(null);
           }
        } else {
           setUser(null);
        }
      } else {
        // If the server returns an error (like 500 during recompile),
        // we keep the current user state to avoid accidental logout.
        console.warn("[AUTH] Session fetch returned error status:", response.status);
      }
    } catch (error) {
      // Network error or fetch failed - DO NOT clear the user.
      // This is crucial for resilience during dev-mode reloads.
      console.error("[AUTH] Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sync with initialSession when it changes (e.g. on full page reload)
    if (filteredInitialSession) {
      setUser(filteredInitialSession);
      setLoading(false);
    } else if (!user) {
      // If no user is present, try to fetch it for the current role
      refreshUser(role);
    }
  }, [filteredInitialSession, role]);

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
