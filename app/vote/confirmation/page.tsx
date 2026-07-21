"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmationPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          router.push("/vote");
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✅
        </div>
        <h1 className="text-xl font-medium text-slate-800 sm:text-2xl">Vote submitted!</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your ballot has been recorded successfully.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Results will be published once voting closes. Thank you for participating.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs leading-5 text-slate-500">
          🔒 Your vote is anonymous and has been securely recorded.
        </div>
        <p className="mt-5 text-xs text-slate-400">Redirecting in {countdown}s...</p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/vote"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            href="/vote/results"
            className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
          >
            View results →
          </Link>
        </div>
      </section>
    </main>
  );
}
