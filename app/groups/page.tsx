'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { groupsApi } from '@/lib/api';

interface Group {
  _id: string;
  name: string;
  description: string;
  creator: any;
  membersCount: number;
  notesCount: number;
  isPublic: boolean;
}

export default function GroupsPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await groupsApi.getAll(page);
        setGroups(response.groups || []);
        setTotalPages(response.pagination?.pages || 1);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load groups',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [page, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Study Groups</h1>
            <p className="text-slate-300 mt-2">Join groups and collaborate with classmates</p>
          </div>
          {isAuthenticated && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Link href="/groups/create">Create Group</Link>
            </Button>
          )}
        </div>

        {groups.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {groups.map((group) => (
                <Card key={group._id} className="bg-slate-700 border-slate-600 p-6 hover:border-blue-500 transition-colors">
                  <h3 className="text-xl font-bold mb-2">{group.name}</h3>
                  <p className="text-slate-300 mb-4 line-clamp-2">{group.description}</p>

                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-600">
                    <img
                      src={group.creator.avatar}
                      alt={group.creator.username}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <div className="text-sm">
                      <p className="font-medium">{group.creator.fullName}</p>
                      <p className="text-slate-400 text-xs">Creator</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-600 text-center">
                    <div>
                      <p className="font-bold text-blue-400">{group.membersCount}</p>
                      <p className="text-xs text-slate-400">Members</p>
                    </div>
                    <div>
                      <p className="font-bold text-blue-400">{group.notesCount}</p>
                      <p className="text-xs text-slate-400">Notes</p>
                    </div>
                  </div>

                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href={`/groups/${group._id}`}>Join Group</Link>
                  </Button>
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
            <p className="text-slate-300 mb-4">No groups available yet</p>
            {isAuthenticated && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/groups/create">Create the First Group</Link>
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
