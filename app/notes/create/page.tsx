'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function CreateNotePage() {
  const router = useRouter();

  const { user } = useAuth();

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [subject, setSubject] =
    useState('');

  const [category, setCategory] =
    useState('');

  const [content, setContent] =
    useState('');

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      let fileUrl = '';

      if (file) {
        const fileName =
          Date.now() + '-' + file.name;

        const { error: uploadError } =
          await supabase.storage
            .from('notes-files')
            .upload(fileName, file);

        if (uploadError)
          throw uploadError;

        const { data } =
          supabase.storage
            .from('notes-files')
            .getPublicUrl(fileName);

        fileUrl =
          data.publicUrl;
      }

      const { error } =
        await supabase
          .from('notes')
          .insert([
            {
              title,
              description,
              subject,
              category,
              content,
              file_url: fileUrl,
              user_id: user?.id,
            },
          ]);

      if (error) throw error;

      alert(
        'Notes uploaded successfully 🚀'
      );

      router.push('/notes');
    } catch (error: any) {
      console.error(error);

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative text-white">

      {/* Background Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600/20 blur-3xl rounded-full" />

      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-600/20 blur-3xl rounded-full" />

      <div className="relative z-10 p-8">

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
            duration: 0.6,
          }}
          className="max-w-4xl mx-auto bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-10 shadow-2xl"
        >

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
            className="text-5xl font-bold mb-3"
          >
            Upload Notes
          </motion.h1>

          <p className="text-zinc-400 mb-10">
            Share your study material with students 🚀
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <motion.input
              whileFocus={{
                scale: 1.02,
              }}
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 outline-none focus:border-blue-500"
              required
            />

            <motion.textarea
              whileFocus={{
                scale: 1.01,
              }}
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 min-h-[120px] outline-none focus:border-blue-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <motion.input
                whileFocus={{
                  scale: 1.02,
                }}
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) =>
                  setSubject(
                    e.target.value
                  )
                }
                className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 outline-none focus:border-blue-500"
              />

              <motion.input
                whileFocus={{
                  scale: 1.02,
                }}
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 outline-none focus:border-blue-500"
              />

            </div>

            <motion.textarea
              whileFocus={{
                scale: 1.01,
              }}
              placeholder="Write full notes here..."
              value={content}
              onChange={(e) =>
                setContent(
                  e.target.value
                )
              }
              className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 min-h-[250px] outline-none focus:border-blue-500"
            />

            <motion.div
              whileHover={{
                scale: 1.02,
              }}
              className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 text-center bg-zinc-800/50"
            >
              <input
                type="file"
                onChange={(e) =>
                  setFile(
                    e.target.files?.[0] ||
                      null
                  )
                }
                className="w-full"
              />

              <p className="text-zinc-400 mt-3">
                Upload PDF, image, notes, docs
              </p>
            </motion.div>

            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 p-5 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/30"
            >
              {loading
                ? 'Uploading...'
                : 'Upload Notes'}
            </motion.button>

          </form>

        </motion.div>

      </div>

    </div>
  );
}