'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import useSWR, { mutate } from 'swr';
import { UserListItemSkeleton, UserDetailSkeleton } from '@/components/Skeleton';

interface UserSummary {
  id: number;
  name: string;
  email: string;
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
  Address?: string;
  Date: string;
  ServiceType: 'FullValue' | 'UBR' | 'P2' | 'UninstalationIDUSTB' | 'UninstalationODU';
  PaymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  ApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface UserDetail {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  summary: {
    totalWorks: number;
    approvedWorks: number;
    pendingApproval: number;
    rejectedWorks: number;
    completedPayment: number;
    pendingPayment: number;
    failedPayment: number;
    totalPaymentDone: number;
    totalPaymentPending: number;
    serviceCounts: {
      FullValue: number;
      UBR: number;
      P2: number;
      Uninstall_IDU: number;
      Uninstall_ODU: number;
    };
  };
  bankInfo?: {
    id: number;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    accountHolder: string;
  } | null;
  workOrders: WorkOrder[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'REJECTED':
    case 'FAILED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'PENDING':
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { data: usersData, error: usersError, isLoading: isLoadingUsers } = useSWR(
    user?.role === 'ADMIN' ? '/api/admin/users' : null,
    fetcher
  );

  const { data: detailData, isLoading: isLoadingDetail } = useSWR(
    selectedUserId ? `/api/admin/users/${selectedUserId}` : null,
    fetcher
  );

  const users = usersData?.users as UserSummary[] || [];
  const selectedUser = detailData?.user as UserDetail | null;

  const updateWorkStatus = async (workId: number, approvalStatus?: string, paymentStatus?: string) => {
    try {
      const response = await fetch(`/api/admin/work/${workId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus, paymentStatus }),
      });

      if (response.ok) {
        mutate(`/api/admin/users/${selectedUserId}`);
        mutate('/api/admin/users');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !selectedUserId || !selectedUser) return;
    setShowConfirmModal(true);
  };

  const confirmUpdatePassword = async () => {
    if (!newPassword || !selectedUserId || !selectedUser) return;

    setShowConfirmModal(false);
    setIsUpdatingPassword(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        alert('Password updated successfully');
        setNewPassword('');
        setShowPassword(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update password');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (authLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!user || user.role !== 'ADMIN') {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0d457f] mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4 h-fit">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Personnel</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {isLoadingUsers ? (
                Array(5).fill(0).map((_, i) => <UserListItemSkeleton key={i} />)
              ) : (
                users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full text-left p-3 rounded transition-colors ${selectedUserId === u.id
                      ? 'bg-[#0d457f] text-white'
                      : 'bg-gray-50 hover:bg-gray-200 text-gray-800'
                      }`}
                  >
                    <div className="font-bold">{u.name}</div>
                    <div className="text-xs opacity-80">{u.email}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* User Detail */}
          <div className="lg:col-span-3">
            {isLoadingDetail ? (
              <UserDetailSkeleton />
            ) : selectedUser ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Works</h3>
                    <p className="text-2xl font-bold">{selectedUser.summary.totalWorks}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Approved</h3>
                    <p className="text-2xl font-bold text-green-600">{selectedUser.summary.approvedWorks}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow border-l-4 border-amber-500">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending Appr.</h3>
                    <p className="text-2xl font-bold text-amber-600">{selectedUser.summary.pendingApproval}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Rejected</h3>
                    <p className="text-2xl font-bold text-red-600">{selectedUser.summary.rejectedWorks}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-400">Full Value</h4>
                    <p className="text-xl font-black text-slate-800">{selectedUser.summary.serviceCounts?.FullValue || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-400">UBR</h4>
                    <p className="text-xl font-black text-slate-800">{selectedUser.summary.serviceCounts?.UBR || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-400">P2</h4>
                    <p className="text-xl font-black text-slate-800">{selectedUser.summary.serviceCounts?.P2 || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-400">Uninstall IDU</h4>
                    <p className="text-xl font-black text-slate-800">{selectedUser.summary.serviceCounts?.Uninstall_IDU || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-400">Uninstall ODU</h4>
                    <p className="text-xl font-black text-slate-800">{selectedUser.summary.serviceCounts?.Uninstall_ODU || 0}</p>
                  </div>
                </div>

                {/* Bank Info & Password Reset */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4 text-[#0d457f]">Bank Details</h2>
                    {selectedUser.bankInfo ? (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-bold">A/C Holder:</span> {selectedUser.bankInfo.accountHolder}</p>
                        <p><span className="font-bold">Bank:</span> {selectedUser.bankInfo.bankName}</p>
                        <p><span className="font-bold">Number:</span> {selectedUser.bankInfo.accountNumber}</p>
                        <p><span className="font-bold">IFSC:</span> {selectedUser.bankInfo.ifscCode}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No bank information provided</p>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4 text-[#0d457f]">Reset Password</h2>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border rounded text-sm outline-none focus:border-[#0d457f] pr-20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0d457f] hover:underline"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <button
                        onClick={handleUpdatePassword}
                        disabled={!newPassword || isUpdatingPassword}
                        className="w-full bg-[#0d457f] text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                      >
                        {isUpdatingPassword ? 'Updating...' : 'Set New Password'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Work Orders Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <h2 className="text-xl font-bold p-6 bg-gray-50 border-b text-[#0d457f]">Work Orders</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr className="text-left text-sm font-bold text-gray-700">
                          <th className="p-4">Customer</th>
                          <th className="p-4">Address</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Approval</th>
                          <th className="p-4">Payment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedUser.workOrders.map((work) => (
                          <tr key={work.id} className="hover:bg-gray-50">
                            <td className="p-4">
                              <div className="font-bold">{work.caustomerName}</div>
                              <div className="text-xs text-gray-500">{work.PhoneNumber}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm font-medium text-gray-700">{work.Address || 'N/A'}</div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">B-ID: {work.BuildingId}</div>
                            </td>
                            <td className="p-4 text-sm">{work.ServiceType}</td>
                            <td className="p-4 text-sm">{new Date(work.Date).toLocaleDateString()}</td>
                            <td className="p-4">
                              <select
                                value={work.ApprovalStatus}
                                onChange={(e) => updateWorkStatus(work.id, e.target.value)}
                                className={`border rounded px-2 py-1 text-xs font-bold outline-none cursor-pointer transition-colors ${getStatusColor(work.ApprovalStatus)}`}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approve</option>
                                <option value="REJECTED">Reject</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <select
                                value={work.PaymentStatus}
                                onChange={(e) => updateWorkStatus(work.id, undefined, e.target.value)}
                                className={`border rounded px-2 py-1 text-xs font-bold outline-none cursor-pointer transition-colors ${getStatusColor(work.PaymentStatus)}`}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="COMPLETED">Settled</option>
                                <option value="FAILED">Failed</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                Select a user to view detailed operational and financial reports
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-6 transform animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-[#0d457f]">Confirm Password Change</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to change the password for <span className="font-bold text-[#0d457f]">{selectedUser?.name}</span>?
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
              <p className="text-xs text-gray-400 uppercase font-black mb-1">New Password</p>
              <p className="text-lg font-mono font-bold text-[#0d457f] break-all">
                {newPassword}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmUpdatePassword}
                className="w-full bg-[#0d457f] hover:bg-[#0a3a66] text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
              >
                Yes, Change Password
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
