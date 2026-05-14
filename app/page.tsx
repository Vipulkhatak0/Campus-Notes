'use client';

import Link from 'next/link';

import { useState } from 'react';

import { motion } from 'framer-motion';

import Lottie from 'lottie-react';

import {
  Upload,
  BookOpen,
  LayoutDashboard,
  Users,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

import { useAuth } from '@/hooks/useAuth';

import saludandoAnimation from '@/public/animations/saludando.json';

export default function HomePage() {
  const { isAuthenticated } =
    useAuth();

  const [file, setFile] =
    useState<File | null>(null);

  const handleUpload =
    async () => {
      if (!file) {
        alert('Select file first');
        return;
      }

      try {
        const fileName = `${Date.now()}-${file.name}`;

        const { error } =
          await supabase.storage
            .from('notes-files')
            .upload(
              fileName,
              file
            );

        if (error) {
          console.error(error);

          alert(
            'Upload failed'
          );

          return;
        }

        alert(
          'Uploaded successfully 🚀'
        );
      } catch (err) {
        console.error(err);

        alert(
          'Something went wrong'
        );
      }
    };

  const features = [
    {
      title: 'Dashboard',
      desc: 'Manage your notes and workspace.',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      title: 'Explore Notes',
      desc: 'Discover study materials and PDFs.',
      icon: BookOpen,
      href: '/notes',
    },
    {
      title: 'Upload Notes',
      desc: 'Share your educational resources.',
      icon: Upload,
      href: '/notes/create',
    },
    {
      title: 'Study Groups',
      desc: 'Collaborate with students.',
      icon: Users,
      href: '/dashboard',
    },
  ];

  return (
    <div className="min-h-screen bg-black overflow-hidden text-white relative">

      {/* Background Glow */}
      <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] bg-blue-600/20 blur-3xl rounded-full" />

      <div className="absolute bottom-[-120px] right-[-120px] w-[500px] h-[500px] bg-purple-600/20 blur-3xl rounded-full" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-zinc-800 backdrop-blur-xl">

        <motion.h1
          initial={{
            opacity: 0,
            x: -40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="text-3xl font-black"
        >
          NotePil 🚀
        </motion.h1>

        <div className="flex items-center gap-5">

          <Link
            href="/dashboard"
            className="text-zinc-300 hover:text-white transition"
          >
            Dashboard
          </Link>

          <Link
            href="/notes"
            className="text-zinc-300 hover:text-white transition"
          >
            Explore
          </Link>

          {!isAuthenticated && (
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl"
            >
              Login
            </Link>
          )}

        </div>

      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-16">

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left */}
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >

            <div className="inline-flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-full px-5 py-3 mb-8">

              <BookOpen
                size={20}
                className="text-blue-400"
              />

              <span className="text-zinc-300">
                Modern College Notes Platform
              </span>

            </div>

            <h1 className="text-6xl md:text-7xl font-black leading-tight">

              Share &
              <span className="text-blue-500">
                {' '}
                Explore
              </span>

              <br />

              Study Notes

            </h1>

            <p className="text-zinc-400 text-xl mt-6 leading-8">
              Upload, explore and manage
              educational resources with a
              futuristic animated notes
              platform.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-5 mt-10">

              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20"
              >
                Open Dashboard
              </Link>

              <Link
                href="/notes"
                className="border border-zinc-700 hover:border-zinc-500 px-8 py-4 rounded-2xl font-bold"
              >
                Explore Notes
              </Link>

            </div>

          </motion.div>

          {/* Animation */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.2,
            }}
            className="flex justify-center"
          >

            <Lottie
              animationData={
                saludandoAnimation
              }
              loop={true}
              className="w-[350px] md:w-[550px] h-[350px] md:h-[550px]"
            />

          </motion.div>

        </div>

      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-24">

        <div className="flex items-center justify-between mb-14">

          <h2 className="text-5xl font-black">
            Platform Features
          </h2>

          <span className="text-zinc-500">
            Explore Everything
          </span>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {features.map(
            (feature, index) => {
              const Icon =
                feature.icon;

              return (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.15,
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                  }}
                  className="relative group"
                >

                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition rounded-3xl" />

                  <Link
                    href={feature.href}
                    className="relative block bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 hover:border-blue-500 rounded-3xl p-8 shadow-xl h-full transition"
                  >

                    <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-6">

                      <Icon
                        size={30}
                        className="text-blue-400"
                      />

                    </div>

                    <h3 className="text-2xl font-black mb-4">
                      {feature.title}
                    </h3>

                    <p className="text-zinc-400 leading-7">
                      {feature.desc}
                    </p>

                  </Link>

                </motion.div>
              );
            }
          )}

        </div>

      </section>

      {/* Upload Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-24">

        <motion.div
          initial={{
            opacity: 0,
            y: 60,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-10 shadow-2xl text-center"
        >

          <h2 className="text-4xl font-black mb-4">
            Upload Your Notes 📚
          </h2>

          <p className="text-zinc-400 text-lg mb-8">
            Share educational content with
            students around the world.
          </p>

          <input
            type="file"
            onChange={(e) =>
              setFile(
                e.target.files?.[0] ||
                  null
              )
            }
            className="mb-6 block w-full bg-zinc-950 border border-zinc-700 rounded-2xl p-4"
          />

          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={handleUpload}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20"
          >
            Upload Notes
          </motion.button>

        </motion.div>

      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-24">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {[
            {
              title: 'Notes Shared',
              value: '10K+',
            },
            {
              title: 'Students',
              value: '5K+',
            },
            {
              title: 'Study Groups',
              value: '500+',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay:
                  index * 0.2,
              }}
              whileHover={{
                scale: 1.03,
              }}
              className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-10 text-center shadow-xl"
            >

              <h2 className="text-5xl font-black text-blue-400 mb-4">
                {item.value}
              </h2>

              <p className="text-zinc-400 text-lg">
                {item.title}
              </p>

            </motion.div>
          ))}

        </div>

      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800 py-10 text-center text-zinc-500">
        Built with Next.js + Supabase 🚀
      </footer>

    </div>
  );
}