'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/authClient';
import { useAuth } from '@/app/context/AuthContext';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    const result = await loginUser(email, password);
    setIsLoading(false);

    if (result.success) {
      await refreshUser();
      router.push(redirect);
    } else {
      setError(result.message);
    }
  };

  return (
    <section className="bg-[#f1f7fe] min-h-screen flex flex-col items-center">
      <div className="mt-12 flex flex-col items-center justify-center gap-6 w-full max-w-md px-4">
        <h2 className="text-2xl font-bold text-[#0d457f]">Login</h2>

        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#0b2546] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-[#83bff6] rounded-lg focus:outline-none focus:border-[#0d457f] focus:ring-2 focus:ring-[#83bff6]"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#0b2546] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-[#83bff6] rounded-lg focus:outline-none focus:border-[#0d457f] focus:ring-2 focus:ring-[#83bff6]"
              disabled={isLoading}
            />
            <div className="mt-1 text-right">
              <span className="text-xs text-gray-500 italic">
                Forgot password? Contact admin to reset.
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0d457f] hover:bg-[#0a3a66] disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-[#0b2546] text-center">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#0d457f] font-bold hover:underline">
            Sign up here
          </Link>
        </p>

        <Link
          href="/"
          className="text-[#0d457f] font-bold hover:underline mt-4"
        >
          ← Back to Home
        </Link>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

