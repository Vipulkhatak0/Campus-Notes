'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (
    email: string,
    password: string
  ) => Promise<void>;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (
    email: string,
    password: string
  ) => {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    console.log(
      'SIGNUP DATA:',
      data
    );

    console.log(
      'SIGNUP ERROR:',
      error
    );

    if (error) {
      alert(error.message);
      throw error;
    }
  };

  const login = async (
    email: string,
    password: string
  ) => {
    const { data, error } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

    console.log(
      'LOGIN DATA:',
      data
    );

    console.log(
      'LOGIN ERROR:',
      error
    );

    if (error) {
      alert(error.message);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
};