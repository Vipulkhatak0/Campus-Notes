'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { NoteCard } from '@/components/NoteCard';
import { useToast } from '@/hooks/use-toast';
import { searchApi } from '@/lib/api';

interface SearchResults {
  notes?: any[];
  users?: any[];
  groups?: any[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { toast } = useToast();

  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState<SearchResults>({});
  const [loading, setLoading] = useState(!!initialQuery);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, searchType, 1);
    }
  }, []);

  const performSearch = async (searchQuery: string, type: string, pageNum: number) => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a search query',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await searchApi.global(
        searchQuery,
        type === 'all' ? undefined : type,
        pageNum
      );
      setResults(response.results || {});
      setPage(pageNum);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Search failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, searchType, 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Search</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search notes, users, or groups..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 flex-1"
            />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6">
              Search
            </Button>
          </div>

          <div className="flex gap-4 flex-wrap">
            {['all', 'notes', 'users', 'groups'].map((type) => (
              <Button
                key={type}
                type="button"
                onClick={() => setSearchType(type)}
                variant={searchType === type ? 'default' : 'outline'}
                className={
                  searchType === type
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'border-slate-600 text-slate-300 hover:text-white'
                }
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </form>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Searching...</p>
          </div>
        ) : query ? (
          <>
            {/* Notes Results */}
            {(searchType === 'all' || searchType === 'notes') && results.notes && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">
                  Notes ({results.notes.data?.length || 0})
                </h2>
                {results.notes.data && results.notes.data.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.notes.data.map((note: any) => (
                      <NoteCard key={note._id} {...note} />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-slate-700 border-slate-600 p-6 text-center">
                    <p className="text-slate-300">No notes found</p>
                  </Card>
                )}
              </div>
            )}

            {/* Users Results */}
            {(searchType === 'all' || searchType === 'users') && results.users && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">
                  Users ({results.users.data?.length || 0})
                </h2>
                {results.users.data && results.users.data.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {results.users.data.map((user: any) => (
                      <Card key={user._id} className="bg-slate-700 border-slate-600 p-4">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-12 h-12 rounded-full mx-auto mb-3 object-cover"
                        />
                        <h3 className="font-semibold text-center mb-1">{user.fullName}</h3>
                        <p className="text-sm text-slate-400 text-center mb-3">@{user.username}</p>
                        <Button asChild variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white" size="sm">
                          <Link href={`/profile/${user._id}`}>View Profile</Link>
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-slate-700 border-slate-600 p-6 text-center">
                    <p className="text-slate-300">No users found</p>
                  </Card>
                )}
              </div>
            )}

            {/* Groups Results */}
            {(searchType === 'all' || searchType === 'groups') && results.groups && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">
                  Groups ({results.groups.data?.length || 0})
                </h2>
                {results.groups.data && results.groups.data.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.groups.data.map((group: any) => (
                      <Card key={group._id} className="bg-slate-700 border-slate-600 p-4">
                        <h3 className="text-lg font-bold mb-2">{group.name}</h3>
                        <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                          {group.description}
                        </p>
                        <div className="grid grid-cols-2 text-center gap-2 mb-4 pb-4 border-b border-slate-600">
                          <div>
                            <p className="font-bold">{group.membersCount}</p>
                            <p className="text-xs text-slate-400">Members</p>
                          </div>
                          <div>
                            <p className="font-bold">{group.notesCount}</p>
                            <p className="text-xs text-slate-400">Notes</p>
                          </div>
                        </div>
                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                          <Link href={`/groups/${group._id}`}>View Group</Link>
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-slate-700 border-slate-600 p-6 text-center">
                    <p className="text-slate-300">No groups found</p>
                  </Card>
                )}
              </div>
            )}
          </>
        ) : (
          <Card className="bg-slate-700 border-slate-600 p-12 text-center">
            <p className="text-slate-300 mb-4">Start searching to discover notes, users, and groups</p>
          </Card>
        )}
      </div>
    </div>
  );
}
