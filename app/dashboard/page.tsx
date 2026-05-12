'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NoteCard } from '@/components/NoteCard';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { notesApi, searchApi, groupsApi } from '@/lib/api';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Note {
  _id: string;
  title: string;
  description: string;
  subject: string;
  author: any;
  category: string;
  likes: string[];
  downloads: number;
  views: number;
  createdAt: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  membersCount: number;
  notesCount: number;
  creator: any;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [recentNotes, setRecentNotes]   = useState<Note[]>([]);
  const [trendingNotes, setTrendingNotes] = useState<Note[]>([]);
  const [topGroups, setTopGroups]       = useState<Group[]>([]);
  const [userNotes, setUserNotes]       = useState<Note[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshKey, setRefreshKey]     = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ── 1. Public data (no auth needed) ──────────────────────────────────
        const [recentRes, trendingRes, groupsRes] = await Promise.allSettled([
          notesApi.getAll(1, 6),
          searchApi.trending(6),
          groupsApi.getAll(1),
        ]);

        // Recent notes
        if (recentRes.status === 'fulfilled') {
          const d = recentRes.value;
          setRecentNotes(d.notes || d || []);
        }

        // Trending notes
        if (trendingRes.status === 'fulfilled') {
          const d = trendingRes.value;
          setTrendingNotes(d.trendingNotes || d.notes || d || []);
        }

        // Groups
        if (groupsRes.status === 'fulfilled') {
          const d = groupsRes.value;
          setTopGroups(d.groups || d || []);
        }

        // ── 2. User-specific data ─────────────────────────────────────────────
        if (user?._id) {
          const userNotesRes = await notesApi.getUserNotes(user._id, 1);
          setUserNotes(userNotesRes.notes || userNotesRes || []);
        }

      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: 'Could not load dashboard',
          description: 'Make sure your backend is running on port 5000.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id, refreshKey]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">Syncing your dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-20">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.fullName || user?.username || 'Student'}!
            </h1>
            <p className="text-slate-300">Manage your notes and discover new resources.</p>
          </div>

          {/* Stats + Quick Action */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="text-slate-400 text-sm font-medium mb-1">Your Total Notes</div>
              <div className="text-4xl font-bold text-blue-400">{userNotes.length}</div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="text-slate-400 text-sm font-medium mb-1">Active Groups</div>
              <div className="text-4xl font-bold text-purple-400">{topGroups.length}</div>
            </Card>

            <Button
              asChild
              className="h-full bg-blue-600 hover:bg-blue-500 text-lg font-bold py-8"
            >
              <Link href="/notes/create">📤 Upload New Note</Link>
            </Button>
          </div>

          {/* Your Recent Notes */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold border-l-4 border-blue-500 pl-4">
                Your Recent Notes
              </h2>
              <Link href="/my-notes" className="text-blue-400 hover:underline text-sm font-medium">
                View All
              </Link>
            </div>

            {userNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userNotes.slice(0, 3).map(note => (
                  <NoteCard key={note._id} {...note} onLikeChange={handleRefresh} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-xl p-12 text-center">
                <p className="text-slate-400 mb-4">You haven't uploaded any notes yet.</p>
                <Button asChild variant="outline" className="border-blue-500 text-blue-400">
                  <Link href="/notes/create">Upload Your First Note</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Trending Notes */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold border-l-4 border-yellow-500 pl-4">
                Trending Now 🔥
              </h2>
              <Link href="/notes" className="text-yellow-400 hover:underline text-sm font-medium">
                Browse All
              </Link>
            </div>

            {trendingNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingNotes.map(note => (
                  <NoteCard key={note._id} {...note} onLikeChange={handleRefresh} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-xl p-8 text-center">
                <p className="text-slate-500">No trending notes yet. Be the first to publish one!</p>
                <Button asChild variant="outline" className="border-yellow-500 text-yellow-400 mt-4">
                  <Link href="/notes/create">Create a Note</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Recent Community Notes */}
          {recentNotes.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold border-l-4 border-green-500 pl-4">
                  Recent Community Notes
                </h2>
                <Link href="/notes" className="text-green-400 hover:underline text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentNotes.slice(0, 6).map(note => (
                  <NoteCard key={note._id} {...note} onLikeChange={handleRefresh} />
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}