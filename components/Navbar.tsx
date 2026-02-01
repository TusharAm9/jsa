'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <nav className="bg-[#0d457f] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold">JSA Dashboard</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="hover:text-[#83bff6] transition-colors font-medium">
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/work" className="hover:text-[#83bff6] transition-colors font-medium">
                  Work Orders
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:text-[#83bff6] transition-colors font-medium">
                    <span>{user.name}</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>
                  <div className="absolute right-0 w-48 bg-white text-[#0b2546] rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-[#f1f7fe] transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/attendance"
                      className="block px-4 py-2 hover:bg-[#f1f7fe] transition-colors"
                    >
                      Attendance
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-[#f1f7fe] transition-colors border-t border-[#83bff6]"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-[#83bff6] transition-colors font-medium">
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#83bff6] text-[#0d457f] px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#0a3a66] transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-[#0a3a66] py-4 space-y-3">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 hover:bg-[#0d457f] rounded-lg transition-colors font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/work"
                  className="block px-4 py-2 hover:bg-[#0d457f] rounded-lg transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Work Orders
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 hover:bg-[#0d457f] rounded-lg transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Profile ({user.name})
                </Link>
                <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-[#f1f7fe] transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/attendance"
                      className="block px-4 py-2 hover:bg-[#f1f7fe] transition-colors"
                    >
                      Attendance
                    </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#0d457f] rounded-lg transition-colors font-medium border-t border-[#083050]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 hover:bg-[#0d457f] rounded-lg transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-4 py-2 bg-[#83bff6] text-[#0d457f] rounded-lg font-bold hover:bg-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
