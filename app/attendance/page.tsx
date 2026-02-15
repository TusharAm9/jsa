"use client";

import { useState } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface AttendanceRecord {
  attendance_date: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Attendance() {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [month, setMonth] = useState<Date>(new Date());

  const params = new URLSearchParams();
  if (fromDate) params.append("from", fromDate);
  if (toDate) params.append("to", toDate);

  const { data, isLoading, mutate } = useSWR(`/api/attendance?${params.toString()}`, fetcher);
  const attendanceDates = (data?.attendance || []).map(
    (a: AttendanceRecord) => new Date(a.attendance_date)
  );

  return (
    <div className="p-6 space-y-6 flex items-center justify-center flex-col min-h-screen bg-[#f1f7fe]">
      <h1 className="text-2xl font-bold text-[#0d457f]">Attendance History</h1>

      <div className="flex flex-wrap items-end gap-4 justify-center bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-2">
          <Label htmlFor="from" className="text-sm font-semibold text-[#0b2546]">
            From *
          </Label>
          <Input
            id="from"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-4 py-2 border border-[#83bff6] rounded-lg"
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
            className="w-full px-4 py-2 border border-[#83bff6] rounded-lg"
          />
        </div>

        <Button
          onClick={() => mutate()}
          disabled={isLoading}
          className="px-6 py-2 bg-[#0d457f] text-white rounded-lg hover:bg-[#08315e]"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <DayPicker
          mode="single"
          month={month}
          onMonthChange={setMonth}
          modifiers={{
            attendance: (date) =>
              attendanceDates.some(
                (d: Date) =>
                  d.getFullYear() === date.getFullYear() &&
                  d.getMonth() === date.getMonth() &&
                  d.getDate() === date.getDate()
              ),
          }}
          modifiersClassNames={{
            attendance: "bg-yellow-300 text-black rounded-full font-bold",
          }}
          className="p-4"
        />
      </div>
    </div>
  );
}
