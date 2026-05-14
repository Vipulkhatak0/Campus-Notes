'use client';

import { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import { motion } from 'framer-motion';

import { supabase } from '@/lib/supabase';

export default function NoteDetailsPage() {
  const params = useParams();

  const [note, setNote] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      const { data, error } =
        await supabase
          .from('notes')
          .select('*')
          .eq('id', params.id)
          .single();

      if (error) {
        console.error(error);
      } else {
        setNote(data);
      }

      setLoading(false);
    };

    fetchNote();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Note not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600/20 blur-3xl rounded-full" />

      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-600/20 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-5xl mx-auto p-8">

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-10 shadow-2xl"
        >

          <div className="flex flex-wrap gap-4 mb-6">

            <span className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full">
              {note.subject}
            </span>

            <span className="bg-purple-600/20 text-purple-400 px-4 py-2 rounded-full">
              {note.category}
            </span>

          </div>

          <h1 className="text-5xl font-black mb-6">
            {note.title}
          </h1>

          <p className="text-zinc-400 text-xl mb-8">
            {note.description}
          </p>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 whitespace-pre-wrap leading-8 text-zinc-300">
            {note.content || 'No content'}
          </div>

          {note.file_url && (
            <div className="mt-10">

              <a
                href={note.file_url}
                target="_blank"
                className="inline-block bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl text-lg font-bold transition"
              >
                Open Uploaded File
              </a>

            </div>
          )}

        </motion.div>

      </div>

    </div>
  );
}