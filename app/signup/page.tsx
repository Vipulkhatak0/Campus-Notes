'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const router = useRouter();

  const { signup } = useAuth();

  const [formData, setFormData] =
    useState({
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      college: '',
      branch: '',
    });

  const [isLoading, setIsLoading] =
    useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      if (
        formData.password !==
        formData.confirmPassword
      ) {
        alert(
          'Passwords do not match'
        );
        return;
      }

      // ✅ SUPABASE SIGNUP
      await signup(
        formData.email,
        formData.password
      );

      alert(
        'Account created successfully 🚀'
      );

      router.push('/login');
    } catch (error: any) {
      console.error(error);

      alert(
        error.message ||
          'Signup failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Account
          </h1>

          <p className="text-zinc-400 mb-8">
            Join your college notes
            community
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <Input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="bg-zinc-800 text-white border-zinc-700"
            />

            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="bg-zinc-800 text-white border-zinc-700"
            />

            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="bg-zinc-800 text-white border-zinc-700"
              required
            />

            <Input
              type="text"
              name="college"
              placeholder="College"
              value={formData.college}
              onChange={handleChange}
              className="bg-zinc-800 text-white border-zinc-700"
            />

            <Input
              type="text"
              name="branch"
              placeholder="Branch"
              value={formData.branch}
              onChange={handleChange}
              className="bg-zinc-800 text-white border-zinc-700"
            />

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-zinc-800 text-white border-zinc-700"
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={
                formData.confirmPassword
              }
              onChange={handleChange}
              className="bg-zinc-800 text-white border-zinc-700"
              required
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading
                ? 'Creating Account...'
                : 'Create Account'}
            </Button>
          </form>

          <p className="text-zinc-400 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300"
            >
              Login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}