'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';

import Lottie from 'lottie-react';

import animationData from '@/public/animations/animation.json';

export default function HomePage() {
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
            x: -50,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="text-3xl font-bold"
        >
          NotePil 🚀
        </motion.h1>

        <div className="flex items-center gap-4">

          <Link
            href="/notes"
            className="text-zinc-300 hover:text-white transition"
          >
            Notes
          </Link>

          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl"
          >
            Login
          </Link>

        </div>

      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20">

        <motion.h1
          initial={{
            opacity: 0,
            y: 50,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          className="text-6xl md:text-8xl font-black leading-tight"
        >
          Share Your
          <span className="text-blue-500">
            {' '}
            Notes
          </span>
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="text-zinc-400 text-xl max-w-2xl mt-8"
        >
          Upload, share and discover
          college notes with modern
          AI-powered experience.
        </motion.p>

        {/* Cartoon Animation */}
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
            delay: 0.3,
          }}
          className="mt-10"
        >

          <Lottie
            animationData={animationData}
            loop={true}
            className="w-[350px] md:w-[500px] h-[350px] md:h-[500px]"
          />

        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.4,
          }}
          className="flex flex-wrap gap-5 mt-5"
        >

          <Link
            href="/notes/create"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl text-lg font-bold shadow-lg shadow-blue-600/30"
          >
            Upload Notes
          </Link>

          <Link
            href="/notes"
            className="border border-zinc-700 hover:border-zinc-500 px-8 py-4 rounded-2xl text-lg font-bold"
          >
            Explore Notes
          </Link>

        </motion.div>

      </section>

      {/* Floating Cards */}
      <div className="relative z-10 mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 px-8 max-w-7xl mx-auto">

        {[
          {
            title: 'Upload Notes',
            desc: 'Share PDFs, docs, images and handwritten notes.',
          },
          {
            title: 'Explore Content',
            desc: 'Find notes from students and colleges instantly.',
          },
          {
            title: 'Modern Platform',
            desc: 'Fast, animated and beautiful study platform.',
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 50,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.2,
            }}
            whileHover={{
              scale: 1.04,
              y: -5,
            }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-xl"
          >

            <h2 className="text-3xl font-bold mb-4">
              {item.title}
            </h2>

            <p className="text-zinc-400 text-lg">
              {item.desc}
            </p>

          </motion.div>
        ))}

      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-16 text-zinc-500">
        Built with Next.js + Supabase 🚀
      </footer>

    </div>
  );
}