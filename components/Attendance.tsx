'use client';

import { useState } from 'react';

type Attendance = {
  attendance_id: bigint;
  attendance_date: string;
  mark_in: string | null;
  mark_out: string | null;
  status: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

export default function AttendanceTable({ selectedUser }: { selectedUser: any }) {
  const [updatingId, setUpdatingId] = useState<bigint | null>(null);

  const updateAttendanceStatus = async (
    attendanceId: bigint,
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  ) => {
    try {
      setUpdatingId(attendanceId);

      const res = await fetch(
        `/api/admin/attendance/${attendanceId.toString()}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ approvalStatus }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to update attendance');
      }

      // Optimistic UI update
      selectedUser.attendences = selectedUser.attendences.map(
        (att: Attendance) =>
          att.attendance_id === attendanceId
            ? { ...att, approval_status: approvalStatus }
            : att
      );

    } catch (error) {
      console.error('Update failed:', error);
      alert('Error updating attendance');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Mark In</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Mark Out</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Approval</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {selectedUser.attendences.map((attendance: Attendance) => (
            <tr
              key={attendance.attendance_id.toString()}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-sm">
                {new Date(attendance.attendance_date).toLocaleDateString()}
              </td>

              <td className="px-4 py-3 text-sm">
                {attendance.mark_in
                  ? new Date(attendance.mark_in).toLocaleTimeString()
                  : '—'}
              </td>

              <td className="px-4 py-3 text-sm">
                {attendance.mark_out
                  ? new Date(attendance.mark_out).toLocaleTimeString()
                  : '—'}
              </td>

              <td className="px-4 py-3 text-sm">
                <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                  {attendance.status}
                </span>
              </td>

              <td className="px-4 py-3 text-sm">
                <select
                  value={attendance.approval_status}
                  disabled={updatingId === attendance.attendance_id}
                  onChange={(e) =>
                    updateAttendanceStatus(
                      attendance.attendance_id,
                      e.target.value as any
                    )
                  }
                  className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer
                    ${
                      attendance.approval_status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : attendance.approval_status === 'REJECTED'
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
                <button
                  onClick={() =>
                    updateAttendanceStatus(
                      attendance.attendance_id,
                      'APPROVED'
                    )
                  }
                  disabled={updatingId === attendance.attendance_id}
                  className="text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-50"
                >
                  {updatingId === attendance.attendance_id
                    ? 'Updating...'
                    : 'Approve'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
