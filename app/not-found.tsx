'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown <= 0) {
            router.push('/');
        }
    }, [countdown, router]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        // Clear interval when countdown reaches 0 or component unmounts
        return () => clearInterval(timer);
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#f1f7fe] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-[#0d457f] animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <h1 className="text-9xl font-black text-[#0d457f] opacity-10">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h2 className="text-3xl font-bold text-[#0b2546]">Oops! Lost?</h2>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-600 text-lg">
                        The page you are looking for doesn't exist or has been moved.
                    </p>
                    <div className="bg-[#f1f7fe] p-4 rounded-lg border border-[#83bff6]">
                        <p className="text-[#0d457f] font-medium">
                            Redirecting you home in <span className="font-bold text-2xl">{countdown}</span> seconds...
                        </p>
                    </div>
                </div>

                <div className="pt-4">
                    <Link
                        href="/"
                        className="inline-block w-full bg-[#0d457f] hover:bg-[#0a3a66] text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg active:scale-95"
                    >
                        Take Me Home Now
                    </Link>
                </div>

                <p className="text-xs text-gray-400 italic">
                    JSA Management Portal &bull; Internal System
                </p>
            </div>
        </div>
    );
}
