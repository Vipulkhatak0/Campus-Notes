'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  college: string;
  branch: string;
  semester: number;
  avatar: string;
  bio: string;
  role: 'user' | 'moderator' | 'admin';
  followers: string[];
  following: string[];
  notesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};