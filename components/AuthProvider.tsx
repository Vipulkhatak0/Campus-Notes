'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext, User } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      if (token && stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (
    email: string,
    username: string,
    password: string,
    fullName = ''
  ) => {
    setLoading(true);
    try {
      const response = await authApi.signup({ email, username, password, fullName });
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user as User);
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user as User);
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  }, [router]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    setLoading(true);
    try {
      const response = await authApi.updateProfile(data);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user as User);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signup,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}