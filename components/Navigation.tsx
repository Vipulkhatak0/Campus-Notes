'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">N</span>
          </div>
          <span className="text-xl font-bold text-white hidden sm:inline">Notes Hub</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <Link
                href="/dashboard"
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/search"
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                Search
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-slate-300 hover:text-white transition-colors text-sm"
                >
                  Admin
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-slate-100">
                    {user.fullName || user.username}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    className="text-slate-200 cursor-pointer"
                    onClick={() => router.push('/profile')}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-slate-200 cursor-pointer"
                    onClick={() => router.push('/settings')}
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    className="text-red-400 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
