'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';

interface NoteCardProps {
  id: string;
  title: string;
  description: string;
  subject: string;
  category: string;
  file_url?: string;
}

export default function NoteCard({
  id,
  title,
  description,
  subject,
  category,
  file_url,
}: NoteCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        scale: 1.03,
        y: -5,
      }}
      transition={{
        duration: 0.4,
      }}
      className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 hover:border-blue-500 rounded-3xl p-6 shadow-xl transition"
    >

      <div className="flex items-center justify-between mb-4">

        <span className="bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-sm font-semibold">
          {subject}
        </span>

        <span className="text-zinc-500 text-sm">
          {category}
        </span>

      </div>

      <h2 className="text-2xl font-bold mb-3 text-white">
        {title}
      </h2>

      <p className="text-zinc-400 mb-6 line-clamp-4">
        {description}
      </p>

      <div className="flex gap-4">

        <Link
          href={`/notes/${id}`}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl font-semibold transition"
        >
          View
        </Link>

        {file_url && (
          <a
            href={file_url}
            target="_blank"
            className="border border-zinc-700 hover:border-zinc-500 px-5 py-2 rounded-xl font-semibold transition"
          >
            Open File
          </a>
        )}

      </div>

    </motion.div>
  );
}