'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { notesApi } from '@/lib/api';

interface NoteCardProps {
  _id: string;
  title: string;
  description: string;
  subject: string;
  author: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  category: string;
  likes: string[];
  downloads: number;
  views: number;
  createdAt: string;
  fileType?: string;
  onLikeChange?: () => void;
}

export function NoteCard({
  _id,
  title,
  description,
  subject,
  author,
  category,
  likes,
  downloads,
  views,
  createdAt,
  fileType = 'pdf',
  onLikeChange,
}: NoteCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isLiked = user && likes.includes(user._id);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await notesApi.unlike(_id);
      } else {
        await notesApi.like(_id);
      }
      onLikeChange?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async () => {
    try {
      await notesApi.download(_id);
      toast({
        title: 'Success',
        description: 'Download recorded',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="bg-slate-700 border-slate-600 hover:border-blue-500 transition-all hover:shadow-lg">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/notes/${_id}`}>
            <h3 className="text-lg font-semibold text-white hover:text-blue-400 line-clamp-2">
              {title}
            </h3>
          </Link>
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded ml-2 flex-shrink-0">
            {category}
          </span>
        </div>

        <p className="text-slate-300 text-sm mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center gap-2 mb-3">
          <img
            src={author.avatar}
            alt={author.username}
            className="h-6 w-6 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{author.fullName}</p>
            <p className="text-xs text-slate-400">{subject}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-3 border-b border-slate-600">
          <span>{views} views</span>
          <span>{downloads} downloads</span>
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            className={`flex-1 ${
              isLiked
                ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
                : 'border-slate-600 text-slate-300 hover:text-white'
            }`}
          >
            ♥ {likes.length}
          </Button>
          <Button
            asChild
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href={`/notes/${_id}`}>View</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
