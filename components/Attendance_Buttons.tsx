'use client';

import { useState } from 'react';
import { GiExitDoor, GiEntryDoor } from 'react-icons/gi';

export default function AttendanceButtons() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const markAttendance = async (type: 'IN' | 'OUT') => {
    console.log(type)
    try {
      setLoading(true);
      setMessage('');

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Error marking attendance');
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
      console.log(message)
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {/* MARK IN */}
      <div
        onClick={() => markAttendance('IN')}
        className={`cursor-pointer bg-[#83bff6] flex flex-col items-center justify-center p-6 rounded-lg shadow-md mt-8 gap-2 hover:shadow-lg hover:bg-[#6aaceb] transition-all ${loading ? 'opacity-50 pointer-events-none' : ''
          }`}
      >
        <GiExitDoor size={40} className="text-green-800" />
        <p className="font-bold text-xs text-green-800 hover:underline">Mark In</p>
      </div>

      {/* MARK OUT */}
      <div
        onClick={() => markAttendance('OUT')}
        className={`cursor-pointer bg-[#83bff6] flex flex-col items-center justify-center p-6 rounded-lg shadow-md mt-8 gap-2 hover:shadow-lg hover:bg-[#6aaceb] transition-all ${loading ? 'opacity-50 pointer-events-none' : ''
          }`}
      >
        <GiEntryDoor size={40} className="text-red-700" />
        <p className="font-bold text-xs text-red-700 hover:underline">Mark Out</p>
      </div>

      {message && (
        <div className="w-full text-center mt-4 text-sm font-medium text-blue-700">
          {message}
        </div>
      )}
    </div>
  );
}
