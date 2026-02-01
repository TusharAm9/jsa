'use client';

import { GrUserWorker, GrWorkshop } from "react-icons/gr";
import { GiExitDoor,GiEntryDoor  } from "react-icons/gi";
import { FaMoneyBillWave } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import AttendanceButtons from "@/components/Attendence";

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  const handleAddWorkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      router.push('/login?redirect=/work/create-work');
    }
  };

  if (isLoading) {
    return (
      <section className="bg-[#f1f7fe] min-h-screen flex flex-col items-center justify-center">
        <div className="bg-[#0d457f] h-16 w-full text-center flex items-center justify-center text-white shadow-md">
          <h1 className="text-4xl uppercase">JSA Dashboard</h1>
        </div>
        <p className="mt-8 text-lg text-[#0d457f]">Loading...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="bg-[#f1f7fe] min-h-screen flex flex-col items-center">
        <div className="mt-12 flex flex-col items-center justify-center gap-6">
          <h2 className="text-2xl font-bold text-[#0d457f]">Welcome to JSA</h2>
          <p className="text-lg text-[#0b2546] text-center max-w-md">
            Please login or create an account to manage your work orders.
          </p>
          
          <div className="flex gap-4 mt-6">
            <Link
              href="/login"
              className="bg-[#0d457f] hover:bg-[#0a3a66] text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-[#83bff6] hover:bg-[#6aaceb] text-[#0b2546] font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f1f7fe] min-h-screen flex flex-col items-center">
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold text-[#0d457f]">
          Welcome, <span className="text-[#83bff6]">{user.name}</span>! 👋
        </h2>
        <p className="text-[#0b2546] mt-2">Email: {user.email}</p>
        <p className="text-2xl font-bold text-[#0d457f]"> {new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })}</p>
      </div>

<AttendanceButtons/>

      <div className="flex flex-wrap justify-center gap-4">
        <div className="bg-[#83bff6] flex flex-col items-center justify-center p-6 rounded-lg shadow-md mt-8 gap-2 hover:shadow-lg hover:bg-[#6aaceb] transition-all">
          <GrUserWorker size={40} className="text-[#0d457f]" />
          <Link
            href="/work/create-work"
            className="font-bold text-xs text-[#0b2546] hover:underline"
          >
            Add work
          </Link>
        </div>
        <div className="bg-[#83bff6] flex flex-col items-center justify-center p-6 rounded-lg shadow-md mt-8 gap-2 hover:shadow-lg hover:bg-[#6aaceb] transition-all">
          <GrWorkshop size={40} className="text-[#0d457f]" />
          <Link
            href="/work"
            className="font-bold text-xs text-[#0b2546] hover:underline"
          >
            Past works
          </Link>
        </div>
        <div className="bg-[#83bff6] flex flex-col items-center justify-center p-6 rounded-lg shadow-md mt-8 gap-2 hover:shadow-lg hover:bg-[#6aaceb] transition-all">
          <FaMoneyBillWave size={40} className="text-[#0d457f]" />
          <Link href="/payment" className="font-bold text-xs text-[#0b2546] hover:underline">Payments</Link>
        </div>
      </div>

      <div className="p-4 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 text-2xl mt-2 underline">Latest News</p>
        <ul className="bg-[#83bff6] p-3 rounded-lg shadow-md">
          <span className="text-[#0b2546]">
            New update: Maintenance schedule for next week has been posted.
          </span>
        </ul>
      </div>
    </section>
  );
}
