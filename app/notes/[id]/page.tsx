'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { notesApi } from '@/lib/api';

interface Comment {
  user: any;
  text: string;
  createdAt: string;
  _id?: string;
}

interface Note {
  _id: string;
  title: string;
  description: string;
  content: string;
  subject: string;
  author: any;
  category: string;
  likes: string[];
  comments: Comment[];
  downloads: number;
  views: number;
  createdAt: string;
  fileUrl?: string;
  fileName?: string;
}

const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?background=3b82f6&color=fff&name=U';

const getAvatar = (avatar?: string, name?: string) =>
  avatar || `https://ui-avatars.com/api/?background=3b82f6&color=fff&name=${encodeURIComponent(name || 'U')}`;

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const fetchNote = async () => {
    try {
      const response = await notesApi.getById(noteId);
      // API may return the note directly or nested under .note
      const noteData = response.note || response;
      setNote(noteData);
      if (user && noteData.likes) {
        setIsLiked(noteData.likes.includes(user._id));
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load note',
        variant: 'destructive',
      });
      router.push('/notes');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchNote();
      setLoading(false);
    };
    load();
  }, [noteId, user?._id]);

  const handleLike = async () => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to like notes', variant: 'destructive' });
      return;
    }
    try {
      if (isLiked) {
        await notesApi.unlike(noteId);
        setIsLiked(false);
      } else {
        await notesApi.like(noteId);
        setIsLiked(true);
      }
      await fetchNote();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to comment', variant: 'destructive' });
      return;
    }
    if (!commentText.trim()) {
      toast({ title: 'Error', description: 'Comment cannot be empty', variant: 'destructive' });
      return;
    }
    try {
      setIsSubmittingComment(true);
      await notesApi.addComment(noteId, { text: commentText });
      setCommentText('');
      await fetchNote();
      toast({ title: 'Success', description: 'Comment added!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDownload = async () => {
    try {
      await notesApi.download(noteId);
      toast({ title: 'Success', description: 'Download recorded' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-700 border-slate-600 p-8 text-center">
          <p className="text-slate-300 mb-4">Note not found</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/notes">Back to Notes</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6 text-slate-300 hover:text-white">
          <Link href="/notes">← Back to Notes</Link>
        </Button>

        <Card className="bg-slate-700 border-slate-600 p-8 mb-6">
          <h1 className="text-4xl font-bold mb-4">{note.title}</h1>

          {/* Author info — fully null-safe */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-600">
            <img
              src={getAvatar(note.author?.avatar, note.author?.fullName || note.author?.username)}
              alt={note.author?.username || 'Author'}
              className="h-12 w-12 rounded-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
            />
            <div className="flex-1">
              <p className="font-semibold text-white">
                {note.author?.fullName || note.author?.username || 'Unknown Author'}
              </p>
              <p className="text-slate-400 text-sm">
                @{note.author?.username || 'unknown'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-300">{note.subject}</p>
              <p className="text-sm text-slate-400">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {note.description && (
            <p className="text-slate-300 mb-6 text-lg">{note.description}</p>
          )}

          {note.content && (
            <div className="bg-slate-800 p-4 rounded-lg mb-6 whitespace-pre-wrap">
              <p className="text-slate-200">{note.content}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-600">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{note.views || 0}</p>
              <p className="text-slate-400 text-sm">Views</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{note.downloads || 0}</p>
              <p className="text-slate-400 text-sm">Downloads</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{note.likes?.length || 0}</p>
              <p className="text-slate-400 text-sm">Likes</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleLike}
              className={`flex-1 ${
                isLiked
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'border-slate-600 text-slate-300 hover:text-white'
              }`}
              variant={isLiked ? 'default' : 'outline'}
            >
              {isLiked ? '♥ Liked' : '♡ Like'}
            </Button>
            {note.fileUrl && (
              <Button
                asChild
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <a href={note.fileUrl} download onClick={handleDownload}>
                  ⬇ Download {note.fileName || 'File'}
                </a>
              </Button>
            )}
          </div>
        </Card>

        {/* Comments */}
        <Card className="bg-slate-700 border-slate-600 p-8">
          <h2 className="text-2xl font-bold mb-6">
            Comments ({note.comments?.length || 0})
          </h2>

          {user ? (
            <form onSubmit={handleAddComment} className="mb-8 pb-8 border-b border-slate-600">
              <div className="flex gap-3">
                <img
                  src={getAvatar(user.avatar, user.fullName || user.username)}
                  alt={user.username}
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
                />
                <div className="flex-1">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400 mb-2"
                  />
                  <Button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <Card className="bg-slate-600 border-slate-500 p-4 mb-8">
              <p className="text-slate-300 mb-3">Sign in to leave a comment</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/login">Sign In</Link>
              </Button>
            </Card>
          )}

          {note.comments?.length > 0 ? (
            <div className="space-y-4">
              {note.comments.map((comment, index) => (
                <div key={comment._id || index} className="flex gap-3">
                  <img
                    src={getAvatar(comment.user?.avatar, comment.user?.fullName || comment.user?.username)}
                    alt={comment.user?.username || 'User'}
                    className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {comment.user?.fullName || comment.user?.username || 'Anonymous'}
                    </p>
                    <p className="text-sm text-slate-400 mb-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-slate-300">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No comments yet. Be the first!</p>
          )}
        </Card>
      </div>
    </div>
  );
}