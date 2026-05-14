'use client';

import Link from 'next/link';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import Lottie from 'lottie-react';

import {
  Upload,
  BookOpen,
  User,
  Search,
} from 'lucide-react';

import booksAnimation from '@/public/animations/books.json';

import { supabase } from '@/lib/supabase';

import { useAuth } from '@/hooks/useAuth';

import NoteCard from '@/components/NoteCard';

export default function DashboardPage() {
  const { user } = useAuth();

  const [notes, setNotes] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } =
        await supabase
          .from('notes')
          .select('*')
          .order('created_at', {
            ascending: false,
          });

      if (error) {
        console.error(error);
      } else {
        setNotes(data || []);
      }

      setLoading(false);
    };

    fetchNotes();
  }, []);

  const filteredNotes =
    notes.filter((note) =>
      note.title
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div className="min-h-screen bg-black overflow-hidden text-white relative">

      {/* Background Glow */}
      <div className="absolute top-[-120px] left-[-120px] w-[450px] h-[450px] bg-blue-600/20 blur-3xl rounded-full" />

      <div className="absolute bottom-[-120px] right-[-120px] w-[450px] h-[450px] bg-purple-600/20 blur-3xl rounded-full" />

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
          Dashboard 🚀
        </motion.h1>

        <div className="flex items-center gap-4">

          <Link
            href="/notes"
            className="text-zinc-300 hover:text-white transition"
          >
            Explore
          </Link>

          <Link
            href="/notes/create"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >

            <Upload size={20} />

            Upload

          </Link>

        </div>

      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-16">

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left Side */}
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

              <User
                size={20}
                className="text-blue-400"
              />

              <span className="text-zinc-300">
                Welcome{' '}
                <span className="text-blue-400 font-bold">
                  {user?.email ||
                    'Student'}
                </span>
              </span>

            </div>

            <h1 className="text-6xl font-black leading-tight">
              Your
              <span className="text-blue-500">
                {' '}
                Learning
              </span>
              <br />
              Dashboard
            </h1>

            <p className="text-zinc-400 text-xl mt-6 leading-8">
              Manage notes, upload files,
              explore educational content
              and build your modern study
              workspace.
            </p>

            {/* Search */}
            <div className="mt-10 relative">

              <Search
                className="absolute left-5 top-4 text-zinc-500"
                size={22}
              />

              <input
                type="text"
                placeholder="Search your notes..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-blue-500 rounded-2xl py-4 pl-14 pr-5 outline-none text-lg"
              />

            </div>

            {/* Quick Buttons */}
            <div className="flex flex-wrap gap-5 mt-10">

              <Link
                href="/notes/create"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20"
              >
                Upload Notes
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
              animationData={booksAnimation}
              loop={true}
              className="w-[350px] md:w-[500px] h-[350px] md:h-[500px]"
            />

          </motion.div>

        </div>

      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-16">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {[
            {
              title: 'Total Notes',
              value:
                filteredNotes.length,
              icon: BookOpen,
            },
            {
              title: 'Uploads',
              value: '120+',
              icon: Upload,
            },
            {
              title: 'Active Users',
              value: '50+',
              icon: User,
            },
          ].map((item, index) => {
            const Icon = item.icon;

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
                    index * 0.2,
                }}
                whileHover={{
                  scale: 1.03,
                }}
                className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-xl"
              >

                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-6">

                  <Icon
                    size={30}
                    className="text-blue-400"
                  />

                </div>

                <h2 className="text-zinc-400 text-lg mb-2">
                  {item.title}
                </h2>

                <p className="text-5xl font-black text-white">
                  {item.value}
                </p>

              </motion.div>
            );
          })}

        </div>

      </section>

      {/* Latest Notes */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-20">

        <div className="flex items-center justify-between mb-10">

          <h2 className="text-4xl font-black">
            Latest Notes
          </h2>

          <span className="text-zinc-500">
            {filteredNotes.length} Notes
          </span>

        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-400">
            Loading notes...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {filteredNotes.map(
              (note, index) => (
                <motion.div
                  key={note.id}
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
                      index * 0.1,
                  }}
                >

                  <NoteCard
                    id={note.id}
                    title={note.title}
                    description={
                      note.description
                    }
                    subject={
                      note.subject
                    }
                    category={
                      note.category
                    }
                    file_url={
                      note.file_url
                    }
                  />

                </motion.div>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}