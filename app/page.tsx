"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const stats = [
  { num: "5", label: "Open positions" },
  { num: "12", label: "Candidates" },
  { num: "842", label: "Registered voters" },
  { num: "73%", label: "Voted so far" },
];

const benefits = [
  {
    icon: "🔒",
    title: "Secure",
    desc: "Invite-only access. Only registered students can vote, verified by email.",
  },
  {
    icon: "🗳️",
    title: "One vote per student",
    desc: "The system prevents duplicate votes at the database level — not just the UI.",
  },
  {
    icon: "📊",
    title: "Live results",
    desc: "Results are published immediately after voting closes with full transparency.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    hours: 47,
    minutes: 58,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const { hours, minutes, seconds } = prev;
        if (seconds > 0) return { hours, minutes, seconds: seconds - 1 };
        if (minutes > 0) return { hours, minutes: minutes - 1, seconds: 59 };
        if (hours > 0) return { hours: hours - 1, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (value: number) => String(value).padStart(2, "0");
  const signIn = () => router.push("/auth/login");

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-800">
      <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <span className="text-sm font-medium text-slate-800 sm:text-[15px]">
            QuickVote
          </span>
        </div>
        <button
          onClick={signIn}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:px-5 sm:text-sm"
        >
          Sign in
        </button>
      </nav>

      <section className="relative isolate overflow-hidden bg-linear-to-br from-indigo-500 to-indigo-700 px-4 py-12 text-center sm:px-6 sm:py-16 lg:py-20">
        <div className="absolute -right-16 -top-16 -z-10 h-60 w-60 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-10 -z-10 h-52 w-52 rounded-full bg-white/5" />

        <div className="mx-auto max-w-2xl">
          <span className="inline-block rounded-full border border-white/20 bg-white/15 px-3.5 py-1 text-[10px] font-medium tracking-wider text-indigo-100 sm:text-xs">
            2024 / 2025 ACADEMIC YEAR
          </span>
          <h1 className="mt-4 text-3xl font-medium leading-tight text-white sm:text-4xl lg:text-5xl">
            Departmental Elections
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-indigo-100 sm:text-base">
            Your vote shapes the leadership of your department. Every vote counts.
          </p>
          <button
            onClick={signIn}
            className="mt-7 rounded-lg bg-white px-6 py-3 text-sm font-medium text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-8"
          >
            Sign in to vote →
          </button>

          <div className="mt-9 sm:mt-10">
            <p className="mb-3 text-[10px] font-medium tracking-widest text-indigo-200 sm:text-xs">
              VOTING CLOSES IN
            </p>
            <div className="mx-auto grid max-w-xs grid-cols-3 gap-2 sm:max-w-sm sm:gap-3">
              {[
                { val: pad(timeLeft.hours), label: "hours" },
                { val: pad(timeLeft.minutes), label: "minutes" },
                { val: pad(timeLeft.seconds), label: "seconds" },
              ].map(({ val, label }) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/20 bg-white/12 px-2 py-3 sm:px-4"
                >
                  <div className="text-2xl font-medium leading-none text-white sm:text-3xl">
                    {val}
                  </div>
                  <div className="mt-1 text-[10px] text-indigo-200 sm:text-xs">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-2 sm:px-6 sm:py-5">
        <div className="mx-auto grid max-w-4xl grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-4 sm:divide-y-0">
          {stats.map(({ num, label }) => (
            <div key={label} className="px-3 py-4 text-center sm:px-5">
              <div className="text-xl font-medium text-slate-800 sm:text-2xl">{num}</div>
              <div className="mt-1 text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-center text-[11px] font-medium tracking-widest text-indigo-500">
          WHY VOTE ONLINE
        </p>
        <h2 className="mt-2 text-center text-xl font-medium text-slate-800 sm:text-2xl">
          Built for fair, transparent elections
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon, title, desc }) => (
            <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-lg">
                {icon}
              </div>
              <h3 className="mt-4 text-sm font-medium text-slate-800">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-4 mb-12 rounded-2xl bg-indigo-500 px-5 py-7 sm:mx-6 sm:px-8 sm:py-9 lg:mx-auto lg:max-w-4xl lg:px-10">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-indigo-100">Ready to vote?</p>
            <h2 className="mt-1 text-xl font-medium text-white sm:text-2xl">
              Your ballot is waiting for you.
            </h2>
          </div>
          <button
            onClick={signIn}
            className="w-full rounded-lg bg-white px-6 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          >
            Sign in to vote →
          </button>
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          <span className="text-sm text-slate-500">QuickVote</span>
        </div>
        <span className="text-xs text-slate-400">
          Nursing Department · {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}
