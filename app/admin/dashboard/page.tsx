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
        (e: { status: string }) => e.status === "active",
      );

      setStats({
        totalVoters: votersData.stats?.total || 0,
        totalVoted: votersData.stats?.voted || 0,
        turnout:
          votersData.stats?.total > 0
            ? Math.round(
                (votersData.stats.voted / votersData.stats.total) * 100,
              )
            : 0,
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
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "18px",
            fontWeight: 500,
            color: "#1e293b",
            margin: "0 0 4px",
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
          Overview of your election system
        </p>
      </div>

      {/* Active election banner */}
      {stats?.activeElection && (
        <div
          style={{
            background: "#dcfce7",
            border: "0.5px solid #bbf7d0",
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                color: "#166534",
                fontWeight: 500,
                marginBottom: "2px",
              }}
            >
              ACTIVE ELECTION
            </div>
            <div
              style={{ fontSize: "14px", fontWeight: 500, color: "#14532d" }}
            >
              {stats.activeElection.title}
            </div>
            <div
              style={{ fontSize: "12px", color: "#166534", marginTop: "2px" }}
            >
              Closes{" "}
              {new Date(stats.activeElection.endDate).toLocaleDateString()}
            </div>
          </div>
          <button
            onClick={() => router.push("/admin/dashboard/results")}
            style={{
              background: "#166534",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            View live results →
          </button>
        </div>
      )}

      {/* No active election */}
      {!loading && !stats?.activeElection && (
        <div
          style={{
            background: "#fef9c3",
            border: "0.5px solid #fde68a",
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "13px", color: "#854d0e" }}>
            No active election. Create and activate one to start voting.
          </div>
          <button
            onClick={() => router.push("/admin/dashboard/elections")}
            style={{
              background: "#854d0e",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Go to elections →
          </button>
        </div>
      )}

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {cards.map(({ label, value, color, bg, href }) => (
          <div
            key={label}
            onClick={() => router.push(href)}
            style={{
              background: "#fff",
              border: "0.5px solid #e2e8f0",
              borderRadius: "10px",
              padding: "16px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: bg,
                marginBottom: "10px",
              }}
            />
            <div style={{ fontSize: "24px", fontWeight: 500, color }}>
              {loading ? "—" : value}
            </div>
            <div
              style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#1e293b",
            margin: "0 0 12px",
          }}
        >
          Quick actions
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
          }}
        >
          {[
            {
              label: "Import voters",
              desc: "Upload a CSV to add voters",
              href: "admin/dashboard/voters",
              icon: "👥",
            },
            {
              label: "Manage elections",
              desc: "Create or activate an election",
              href: "admin/dashboard/elections",
              icon: "🗳️",
            },
            {
              label: "View results",
              desc: "See live vote counts",
              href: "admin/dashboard/results",
              icon: "📈",
            },
          ].map(({ label, desc, href, icon }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              style={{
                background: "#fff",
                border: "0.5px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "20px" }}>{icon}</span>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#1e293b",
                    marginBottom: "3px",
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
