'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';

interface Stats {
  totalUsers: number;
  totalNotes: number;
  totalGroups: number;
  flaggedNotes: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getStats();
        setStats({
          totalUsers: response.totalUsers || 0,
          totalNotes: response.totalNotes || 0,
          totalGroups: response.totalGroups || 0,
          flaggedNotes: response.flaggedNotes || 0,
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load admin stats',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading admin dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-700 border-slate-600 p-6">
              <p className="text-slate-300 text-sm mb-2">Total Users</p>
              <p className="text-3xl font-bold text-blue-400">{stats?.totalUsers || 0}</p>
            </Card>
            <Card className="bg-slate-700 border-slate-600 p-6">
              <p className="text-slate-300 text-sm mb-2">Total Notes</p>
              <p className="text-3xl font-bold text-green-400">{stats?.totalNotes || 0}</p>
            </Card>
            <Card className="bg-slate-700 border-slate-600 p-6">
              <p className="text-slate-300 text-sm mb-2">Total Groups</p>
              <p className="text-3xl font-bold text-purple-400">{stats?.totalGroups || 0}</p>
            </Card>
            <Card className="bg-slate-700 border-slate-600 p-6">
              <p className="text-slate-300 text-sm mb-2">Flagged Notes</p>
              <p className="text-3xl font-bold text-red-400">{stats?.flaggedNotes || 0}</p>
            </Card>
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-700 border-slate-600 p-6">
              <h2 className="text-2xl font-bold mb-4">Moderation</h2>
              <p className="text-slate-300 mb-4">Review and manage flagged content</p>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/admin/moderation">Review Flagged Notes</Link>
              </Button>
            </Card>

            <Card className="bg-slate-700 border-slate-600 p-6">
              <h2 className="text-2xl font-bold mb-4">User Management</h2>
              <p className="text-slate-300 mb-4">Manage users and assign roles</p>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </Card>

            <Card className="bg-slate-700 border-slate-600 p-6">
              <h2 className="text-2xl font-bold mb-4">Content Management</h2>
              <p className="text-slate-300 mb-4">View and manage all notes on platform</p>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/admin/notes">All Notes</Link>
              </Button>
            </Card>

            <Card className="bg-slate-700 border-slate-600 p-6">
              <h2 className="text-2xl font-bold mb-4">Analytics</h2>
              <p className="text-slate-300 mb-4">View platform analytics and trends</p>
              <Button variant="outline" disabled className="w-full border-slate-600 text-slate-400">
                Coming Soon
              </Button>
            </Card>
          </div>

          {/* Info Box */}
          <Card className="bg-blue-900 border-blue-700 p-6 mt-8">
            <h3 className="text-lg font-bold mb-2">Admin Guide</h3>
            <ul className="text-slate-300 space-y-2 text-sm">
              <li>• Review flagged content and take moderation actions</li>
              <li>• Manage user roles and permissions</li>
              <li>• Monitor platform statistics and growth</li>
              <li>• Ensure community guidelines are followed</li>
            </ul>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
