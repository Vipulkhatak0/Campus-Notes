'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return alert("Select file first");

    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    alert("Uploaded successfully 🚀");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Share Knowledge,
            <span className="text-blue-400"> Learn Together</span>
          </motion.h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
            A collaborative platform for college students to share notes, discover resources, and build learning communities
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            {isAuthenticated ? (
              <>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-lg">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="border-blue-500 text-blue-400 hover:text-blue-300 px-8 py-6 text-lg">
                  <Link href="/notes">Explore Notes</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-lg">
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button asChild variant="outline" className="border-blue-500 text-blue-400 hover:text-blue-300 px-8 py-6 text-lg">
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features with scroll animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-20">
          {["📚 Share Notes", "🔍 Discover", "👥 Join Groups"].map((title, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-700 border-slate-600 p-6">
                <div className="text-3xl mb-3">{title.split(" ")[0]}</div>
                <h3 className="text-xl font-bold mb-2">{title.split(" ").slice(1).join(" ")}</h3>
                <p className="text-slate-300">
                  {i === 0 && "Upload and share your study materials"}
                  {i === 1 && "Find notes easily by subject"}
                  {i === 2 && "Connect with classmates"}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Upload Notes Section 🔥 */}
        <motion.div
          initial={{ opacity: 0, y: 150 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-slate-800 p-10 rounded-xl text-center my-20"
        >
          <h2 className="text-3xl font-bold mb-4">Upload Your Notes 📚</h2>
          <p className="text-slate-300 mb-6">
            Share your notes with students and help others learn
          </p>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4"
          />

          <br />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleUpload}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            Upload Notes
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-slate-700">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400 mb-2">10K+</p>
            <p className="text-slate-300">Notes Shared</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400 mb-2">5K+</p>
            <p className="text-slate-300">Active Students</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-400 mb-2">500+</p>
            <p className="text-slate-300">Study Groups</p>
          </div>
        </div>

      </div>
    </div>
  );
}