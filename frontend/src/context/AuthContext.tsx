import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../lib/config';
import { type User } from '../dao/QuestDAO';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Invalid email or password');
      const data = await res.json();
      setUser(data.user);
    } catch (e: any) {
      setError(e.message || 'Login failed');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setUser(null);
    } catch (e: any) {
      setError(e.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/me`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Not logged in');
      const data = await res.json();
      setUser(data.user);
    } catch (e: any) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
