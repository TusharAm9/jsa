'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

interface UserSummary {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  summary: {
    totalWorks: number;
    approvedWorks: number;
    pendingApproval: number;
    completedPayment: number;
    pendingPayment: number;
  };
}

interface WorkOrder {
  id: number;
  caustomerName: string;
  PhoneNumber: string;
  BuildingId: string;
  Date: string;
  ServiceType: 'FullValue' | 'UBR' | 'P2';
  PaymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  ApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface UserDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  summary: {
    totalWorks: number;
    approvedWorks: number;
    pendingApproval: number;
    rejectedWorks: number;
    completedPayment: number;
    pendingPayment: number;
    failedPayment: number;
  };
  workOrders: WorkOrder[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingWorkId, setUpdatingWorkId] = useState<number | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch JSA users
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchJSAUsers();
    }
  }, [user]);

  const fetchJSAUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setError(null);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      setUsers(data.users || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchUserDetail = async (userId: number) => {
    try {
      setIsLoadingDetail(true);
      setError(null);
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user details');
      }

      setSelectedUser(data.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const updateWorkStatus = async (
    workId: number,
    approvalStatus?: string,
    paymentStatus?: string
  ) => {
    try {
      setUpdatingWorkId(workId);
      setError(null);

      const response = await fetch(`/api/admin/work/${workId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus, paymentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update work order');
      }

      // Refresh user details
      if (selectedUser) {
        await fetchUserDetail(selectedUser.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setUpdatingWorkId(null);
    }
  };

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

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-linear-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0d457f] mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage JSA users, approve works, and track payments</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Users List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#0d457f] mb-4">JSA Users</h2>

              {isLoadingUsers ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d457f]"></div>
                  <p className="mt-2 text-gray-500 text-sm">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No JSA users found</p>
              ) : (
                <div className="space-y-2 max-h-150 overflow-y-auto">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => fetchUserDetail(u.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedUser?.id === u.id
                          ? 'bg-[#0d457f] text-white'
                          : 'bg-gray-100 text-[#0b2546] hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-semibold text-sm">{u.name}</div>
                      <div className="text-xs mt-1 opacity-80">{u.email}</div>
                      <div className="text-xs mt-2 flex gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {u.summary.totalWorks} works
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: User Details */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <div className="space-y-6">
                {/* User Summary */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-[#0d457f]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-[#0d457f]">{selectedUser.name}</h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      {selectedUser.phone && <p className="text-gray-600">{selectedUser.phone}</p>}
                    </div>
                    <div className="text-xs text-gray-500">
                      Member since {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedUser.summary.totalWorks}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Total Works</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedUser.summary.approvedWorks}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Approved</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedUser.summary.pendingApproval}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Pending Approval</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedUser.summary.rejectedWorks}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Rejected</div>
                    </div>
                  </div>

                  {/* Payment Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {selectedUser.summary.completedPayment}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Payment Completed</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {selectedUser.summary.pendingPayment}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Payment Pending</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {selectedUser.summary.failedPayment}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Payment Failed</div>
                    </div>
                  </div>
                </div>

                {/* Work Orders Table */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-[#0d457f] mb-4">Past Work Orders</h3>

                  {isLoadingDetail ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d457f]"></div>
                    </div>
                  ) : selectedUser.workOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No work orders found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-300">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                              Customer
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                              Building
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                              Type
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                              Approval
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                              Payment
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedUser.workOrders.map((work) => (
                            <tr key={work.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {work.caustomerName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {work.BuildingId}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                                  {work.ServiceType}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <select
                                  value={work.ApprovalStatus}
                                  onChange={(e) =>
                                    updateWorkStatus(work.id, e.target.value)
                                  }
                                  disabled={updatingWorkId === work.id}
                                  className={`px-2 py-1 rounded text-xs font-semibold border-none cursor-pointer ${
                                    work.ApprovalStatus === 'APPROVED'
                                      ? 'bg-green-100 text-green-800'
                                      : work.ApprovalStatus === 'REJECTED'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  } disabled:opacity-50`}
                                >
                                  <option value="PENDING">Pending</option>
                                  <option value="APPROVED">Approved</option>
                                  <option value="REJECTED">Rejected</option>
                                </select>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <select
                                  value={work.PaymentStatus}
                                  onChange={(e) =>
                                    updateWorkStatus(work.id, undefined, e.target.value)
                                  }
                                  disabled={updatingWorkId === work.id}
                                  className={`px-2 py-1 rounded text-xs font-semibold border-none cursor-pointer ${
                                    work.PaymentStatus === 'COMPLETED'
                                      ? 'bg-green-100 text-green-800'
                                      : work.PaymentStatus === 'FAILED'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  } disabled:opacity-50`}
                                >
                                  <option value="PENDING">Pending</option>
                                  <option value="COMPLETED">Completed</option>
                                  <option value="FAILED">Failed</option>
                                </select>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <button
                                  onClick={() =>
                                    updateWorkStatus(work.id, 'APPROVED', 'COMPLETED')
                                  }
                                  disabled={updatingWorkId === work.id}
                                  className="text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-50"
                                >
                                  {updatingWorkId === work.id ? 'Updating...' : 'Approve & Pay'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">Select a user to view their work details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
