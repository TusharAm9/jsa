"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface AttendanceRecord {
  attendance_date: string;
}

export default function Attendance() {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [attendanceDates, setAttendanceDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState<Date>(new Date()); // <-- calendar month

  const fetchAttendance = async (from?: string, to?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const res = await fetch(`/api/attendence?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        // Convert attendance dates to Date objects
        const dates = data.attendance.map(
          (a: AttendanceRecord) => new Date(a.attendance_date)
        );
        setAttendanceDates(dates);

        // Show the month of the first attendance date (or current month if none)
        if (dates.length > 0) {
          setMonth(dates[0]);
        } else {
          setMonth(new Date());
        }
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all attendance on initial load
  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleSearch = () => {
    fetchAttendance(fromDate, toDate);
  };

  return (
    <div className="p-6 space-y-6 flex items-center justify-center flex-col">
      {/* Date range search */}
      <div className="flex items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="from" className="text-sm font-semibold text-[#0b2546]">
            From *
          </Label>
          <Input
            id="from"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#83bff6] rounded-lg focus:ring-2 focus:ring-[#0d457f] focus:border-transparent transition"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="to" className="text-sm font-semibold text-[#0b2546]">
            To *
          </Label>
          <Input
            id="to"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#83bff6] rounded-lg focus:ring-2 focus:ring-[#0d457f] focus:border-transparent transition"
          />
        </div>

        <Button
          onClick={handleSearch}
          disabled={loading}
          className="mt-6 px-6 py-2.5 bg-[#0d457f] text-white rounded-lg hover:bg-[#08315e]"
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Calendar */}
      <div className="mt-6">
        <DayPicker
          mode="single"
          selected={undefined}
          month={month} // <-- show this month
          modifiers={{
            attendance: (date) =>
              attendanceDates.some(
                (d) =>
                  d.getFullYear() === date.getFullYear() &&
                  d.getMonth() === date.getMonth() &&
                  d.getDate() === date.getDate()
              ),
          }}
          modifiersClassNames={{
            attendance: "bg-yellow-300 text-black rounded-full",
          }}
          className="bg-white p-4 rounded-lg shadow"
        />
      </div>
    </div>
  );
}
