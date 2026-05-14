'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();

  const { login } = useAuth();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await login(email, password);

      router.push('/');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 blur-3xl rounded-full top-[-100px] left-[-100px]" />

      <div className="absolute w-[400px] h-[400px] bg-purple-600/20 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />

      <motion.div
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="relative z-10 w-full max-w-md"
      >

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">

          <motion.h1
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="text-4xl font-bold text-white mb-2 text-center"
          >
            Welcome Back
          </motion.h1>

          <p className="text-zinc-400 text-center mb-8">
            Login to your notes account
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <motion.input
              whileFocus={{
                scale: 1.02,
              }}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full p-4 rounded-2xl bg-zinc-800 text-white border border-zinc-700 outline-none focus:border-blue-500 transition"
              required
            />

            <motion.input
              whileFocus={{
                scale: 1.02,
              }}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="w-full p-4 rounded-2xl bg-zinc-800 text-white border border-zinc-700 outline-none focus:border-blue-500 transition"
              required
            />

            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.98,
              }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl font-bold text-white shadow-lg shadow-blue-600/30"
            >
              {loading
                ? 'Logging in...'
                : 'Login'}
            </motion.button>

            {/* CREATE ACCOUNT OPTION */}

            <div className="mt-6 text-center">
              <p className="text-zinc-400 text-sm">
                Don&apos;t have an account?
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push('/signup')
                }
                className="text-blue-500 hover:text-blue-400 font-semibold mt-2"
              >
                Create Account
              </button>
            </div>

          </form>

        </div>

      </motion.div>

    </div>
  );
}