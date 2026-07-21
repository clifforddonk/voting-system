"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Stats = {
  totalVoters: number;
  totalVoted: number;
  turnout: number;
  activeElection: { title: string; endDate: string } | null;
  pending: number;
  invited: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [votersRes, electionsRes] = await Promise.all([
        fetch("/api/admin/voters"),
        fetch("/api/admin/elections"),
      ]);
      const [votersData, electionsData] = await Promise.all([
        votersRes.json(),
        electionsRes.json(),
      ]);

      const activeElection = electionsData.elections?.find(
        (e: { _id: string; status: string }) => e.status === "active",
      );

      const resultsData = activeElection
        ? await fetch(`/api/results/${activeElection._id}`).then((response) => response.json())
        : null;

      setStats({
        totalVoters: votersData.stats?.total || 0,
        totalVoted: resultsData?.stats?.totalVoted || 0,
        turnout: resultsData?.stats?.turnout || 0,
        activeElection: activeElection || null,
        pending: votersData.stats?.pending || 0,
        invited: votersData.stats?.invited || 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total voters",
      value: stats?.totalVoters ?? "—",
      color: "#6366f1",
      bg: "#eef2ff",
      href: "/admin/dashboard/voters",
    },
    {
      label: "Votes cast",
      value: stats?.totalVoted ?? "—",
      color: "#166534",
      bg: "#dcfce7",
      href: "/admin/dashboard/results",
    },
    {
      label: "Voter turnout",
      value: stats ? `${stats.turnout}%` : "—",
      color: "#854d0e",
      bg: "#fef9c3",
      href: "/admin/dashboard/results",
    },
    {
      label: "Pending invites",
      value: stats?.pending ?? "—",
      color: "#1e40af",
      bg: "#dbeafe",
      href: "/admin/dashboard/voters",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Overview of your election system
        </p>
      </div>

      {stats?.activeElection && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Active election
            </div>
            <div className="text-base font-semibold text-emerald-800">
              {stats.activeElection.title}
            </div>
            <div className="mt-1 text-sm text-emerald-700">
              Closes{" "}
              {new Date(stats.activeElection.endDate).toLocaleDateString()}
            </div>
          </div>
          <button
            onClick={() => router.push("/admin/dashboard/results")}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
          >
            View live results →
          </button>
        </div>
      )}

      {!loading && !stats?.activeElection && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="text-sm text-amber-800">
            No active election. Create and activate one to start voting.
          </div>
          <button
            onClick={() => router.push("/admin/dashboard/elections")}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
          >
            Go to elections →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, color, bg, href }) => (
          <div
            key={label}
            onClick={() => router.push(href)}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className="mb-3 h-7 w-7 rounded-lg"
              style={{ background: bg }}
            />
            <div className="text-2xl font-semibold" style={{ color }}>
              {loading ? "—" : value}
            </div>
            <div className="mt-1 text-sm text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            {
              label: "Import voters",
              desc: "Upload a CSV to add voters",
              href: "/admin/dashboard/voters",
              icon: "👥",
            },
            {
              label: "Manage elections",
              desc: "Create, activate, or close an election",
              href: "/admin/dashboard/elections",
              icon: "🗳️",
            },
            {
              label: "Review results",
              desc: "Track counts and winners",
              href: "/admin/dashboard/results",
              icon: "📊",
            },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.href)}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <div className="mb-2 text-xl">{action.icon}</div>
              <div className="text-sm font-semibold text-slate-700">
                {action.label}
              </div>
              <div className="mt-1 text-sm text-slate-500">{action.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
