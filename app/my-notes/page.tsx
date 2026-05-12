'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { notesApi } from '@/lib/api';

interface Note {
  _id: string;
  title: string;
  description: string;
  subject: string;
  category: string;
  likes: string[];
  downloads: number;
  views: number;
  createdAt: string;
}

export default function MyNotesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const response = await notesApi.getUserNotes(user._id, page);
        setNotes(response.notes || []);
        setTotalPages(response.pagination?.pages || 1);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load notes',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user, page, toast]);

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesApi.delete(noteId);
      setNotes(notes.filter((n) => n._id !== noteId));
      toast({
        title: 'Success',
        description: 'Note deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete note',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading your notes...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold">My Notes</h1>
              <p className="text-slate-300 mt-2">{notes.length} notes published</p>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Link href="/notes/create">Create New Note</Link>
            </Button>
          </div>

          {notes.length > 0 ? (
            <>
              <div className="grid gap-4 mb-8">
                {notes.map((note) => (
                  <Card key={note._id} className="bg-slate-700 border-slate-600 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/notes/${note._id}`}>
                          <h3 className="text-xl font-semibold text-white hover:text-blue-400 mb-2">
                            {note.title}
                          </h3>
                        </Link>
                        <p className="text-slate-300 mb-3">{note.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                          <span>{note.subject}</span>
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            {note.category}
                          </span>
                          <span>{note.views} views</span>
                          <span>{note.downloads} downloads</span>
                          <span>♥ {note.likes.length}</span>
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button asChild variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">
                          <Link href={`/notes/${note._id}`}>View</Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(note._id)}
                          className="border-red-600 text-red-400 hover:text-red-300"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="border-slate-600 text-slate-300 hover:text-white disabled:opacity-50"
                >
                  Previous
                </Button>
                <span className="text-slate-300">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-slate-600 text-slate-300 hover:text-white disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <Card className="bg-slate-700 border-slate-600 p-12 text-center">
              <p className="text-slate-300 mb-4">You haven't created any notes yet</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/notes/create">Create Your First Note</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
