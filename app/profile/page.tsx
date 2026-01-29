'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, isLoading, router]);

  const fetchProfile = async () => {
    try {
      setPageLoading(true);
      setError(null);
      const response = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setNewPhone(data.phone || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setPageLoading(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!newPhone.trim()) {
      setError('Phone number cannot be empty');
      return;
    }

    if (!/^\d{10}$/.test(newPhone.replace(/\D/g, ''))) {
      setError('Phone number must be 10 digits');
      return;
    }

    try {
      setPhoneLoading(true);
      setError(null);
      const response = await fetch('/api/profile/update-phone', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: newPhone }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update phone');
      }

      setSuccessMessage('Phone number updated successfully!');
      if (profile) {
        setProfile({ ...profile, phone: newPhone });
      }
      setEditingPhone(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update phone');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setPasswordLoading(true);
      setError(null);
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccessMessage('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-700"
          >
            ← Back to Home
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <h2 className="font-semibold text-lg mb-2">Error Loading Profile</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <div className="w-20"></div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Profile Information</h2>

          {/* Name */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-600 uppercase">Full Name</label>
            <p className="text-lg text-gray-900 mt-1">{profile.name}</p>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-600 uppercase">Email</label>
            <p className="text-lg text-gray-900 mt-1">{profile.email}</p>
          </div>

          {/* Role */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-600 uppercase">Role</label>
            <p className="mt-1">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">
                {profile.role}
              </span>
            </p>
          </div>

          {/* Member Since */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-600 uppercase">Member Since</label>
            <p className="text-lg text-gray-900 mt-1">{formatDate(profile.createdAt)}</p>
          </div>

          {/* Phone Number */}
          <div className="mb-8 pb-8 border-b">
            <label className="text-sm font-semibold text-gray-600 uppercase block mb-2">Mobile Number</label>
            {editingPhone ? (
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  maxLength={10}
                />
                <button
                  onClick={handleUpdatePhone}
                  disabled={phoneLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {phoneLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingPhone(false);
                    setNewPhone(profile.phone || '');
                  }}
                  className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="text-lg text-gray-900">{profile.phone || 'Not provided'}</p>
                <button
                  onClick={() => setEditingPhone(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Change Password Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Security</h3>
            {showPasswordForm ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase block mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase block mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase block mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    className="bg-gray-300 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Change Password
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
