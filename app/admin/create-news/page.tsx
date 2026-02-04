'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormData {
    title: string;
    content: string;
}

export default function CreateNews() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title:"",
    content:""
  });

  // Check if user is logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/admin/create-news');
    }
  }, [user, authLoading, router]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d457f]"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, return null (useEffect will handle redirect)
  if (!user) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - redirect to login
          router.push('/login?redirect=/admin/create-news');
          return;
        }
        throw new Error(data.message || 'Failed to create news');
      }

      setSuccessMessage('News created successfully!');
      
      // Reset form
      setFormData({
        title:'',
        content:''
      });

      // Redirect to work orders page after 2 seconds
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the news';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl p-8 border-t-4 border-[#0d457f]">
        <h1 className="text-3xl font-bold text-[#0d457f] mb-2">Create Latest News</h1>
        <p className="text-gray-600 mb-8">Fill in the details to create a new news</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700 font-medium flex items-start gap-2">
              <span className="text-red-500 font-bold">⚠</span>
              {error}
            </p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <p className="text-green-700 font-medium flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              {successMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="Title" className="text-sm font-semibold text-[#0b2546]">
              Title *
            </Label>
            <Input
              id="Title"
              name="title"
              type="text"
              placeholder="Enter news title"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 border border-[#83bff6] rounded-lg focus:ring-2 focus:ring-[#0d457f] focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-semibold text-[#0b2546]">
              Content *
            </Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Enter news content"
              value={formData.content}
              onChange={handleChange}
              disabled={isSubmitting}
              maxLength={2000}
              className="w-full px-4 py-2.5 border border-[#83bff6] rounded-lg focus:ring-2 focus:ring-[#0d457f] focus:border-transparent transition disabled:bg-gray-100"
            />
          </div>
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0d457f] hover:bg-[#0a3a66] text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating News...' : 'Create News'}
          </Button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Fields marked with * are required
        </p>
      </div>
    </div>
  );
}
