'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface Attendance {
  attendance_id: string;
  attendance_date: string;
  mark_in: string | null;
  mark_out: string | null;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface UserSummary {
  id: number;
  name: string;
  email: string;
  summary: {
    totalWorks: number;
  };
}

interface UserDetail {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  attendences: Attendance[];
}

export default function AttendanceDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* Auth Guard */
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserDetail = async (userId: number) => {
    try {
      setLoadingDetail(true);
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSelectedUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const updateAttendanceStatus = async (attendanceId: string, approvalStatus: string) => {
    try {
      setUpdatingId(attendanceId);
      await fetch(`/api/admin/attendance/${attendanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus }),
      });

      if (selectedUser) fetchUserDetail(selectedUser.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <h1 className="text-3xl font-bold text-[#0d457f] mb-6">
        Attendance Management Dashboard
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="font-bold text-lg mb-3">Employees</h2>

          {loadingUsers ? (
            <p>Loading users...</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => fetchUserDetail(u.id)}
                  className={`w-full text-left p-3 rounded ${
                    selectedUser?.id === u.id
                      ? 'bg-[#0d457f] text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-xs">{u.email}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Table */}
        <div className="lg:col-span-2 bg-white shadow rounded p-6">
          {!selectedUser ? (
            <p className="text-center text-gray-500">
              Select a user to view attendance records
            </p>
          ) : loadingDetail ? (
            <p>Loading attendance...</p>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4 text-[#0d457f]">
                {selectedUser.name} - Attendance Records
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Mark In</th>
                      <th className="p-2 text-left">Mark Out</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.attendences.map((a) => (
                      <tr key={a.attendance_id} className="border-t">
                        <td className="p-2">{a.attendance_date}</td>
                        <td className="p-2">{a.mark_in ?? '--'}</td>
                        <td className="p-2">{a.mark_out ?? '--'}</td>

                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              a.approval_status === 'APPROVED'
                                ? 'bg-green-100 text-green-700'
                                : a.approval_status === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {a.approval_status}
                          </span>
                        </td>

                        <td className="p-2">
                          <select
                            value={a.approval_status}
                            disabled={updatingId === a.attendance_id}
                            onChange={(e) =>
                              updateAttendanceStatus(a.attendance_id, e.target.value)
                            }
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approve</option>
                            <option value="REJECTED">Reject</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
