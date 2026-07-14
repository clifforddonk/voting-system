"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({ hours: 47, minutes: 58, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) return { hours, minutes, seconds: seconds - 1 };
        if (minutes > 0) return { hours, minutes: minutes - 1, seconds: 59 };
        if (hours > 0) return { hours: hours - 1, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>

      {/* Navbar */}
      <nav style={{
        background: "#fff",
        borderBottom: "0.5px solid #e2e8f0",
        padding: "0 32px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1" }} />
          <span style={{ fontWeight: 500, fontSize: "15px", color: "#1e293b" }}>QuickVote</span>
        </div>
        <button
          onClick={() => router.push("/auth/login")}
          style={{
            background: "#6366f1",
            color: "#fff",
            border: "none",
            padding: "8px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        padding: "64px 32px 56px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }} />
        <div style={{
          position: "absolute", bottom: "-80px", left: "-40px",
          width: "200px", height: "200px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />

        <div style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.15)",
          color: "#e0e7ff",
          fontSize: "11px",
          fontWeight: 500,
          padding: "4px 14px",
          borderRadius: "20px",
          marginBottom: "16px",
          border: "0.5px solid rgba(255,255,255,0.2)",
          letterSpacing: "0.04em",
        }}>
          2024 / 2025 ACADEMIC YEAR
        </div>

        <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: 500, margin: "0 0 10px", lineHeight: 1.2 }}>
          Departmental Elections
        </h1>
        <p style={{ color: "#c7d2fe", fontSize: "14px", margin: "0 0 32px", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
          Your vote shapes the leadership of your department. Every vote counts.
        </p>

        <button
          onClick={() => router.push("/auth/login")}
          style={{
            background: "#fff",
            color: "#4f46e5",
            border: "none",
            padding: "12px 32px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Sign in to vote →
        </button>

        {/* Countdown */}
        <div style={{ marginTop: "40px" }}>
          <p style={{ color: "#a5b4fc", fontSize: "11px", marginBottom: "12px", letterSpacing: "0.06em" }}>
            VOTING CLOSES IN
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            {[
              { val: pad(timeLeft.hours), label: "hours" },
              { val: pad(timeLeft.minutes), label: "minutes" },
              { val: pad(timeLeft.seconds), label: "seconds" },
            ].map(({ val, label }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.12)",
                border: "0.5px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "12px 20px",
                minWidth: "64px",
              }}>
                <div style={{ color: "#fff", fontSize: "24px", fontWeight: 500, lineHeight: 1 }}>{val}</div>
                <div style={{ color: "#a5b4fc", fontSize: "10px", marginTop: "4px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        background: "#fff",
        borderBottom: "0.5px solid #e2e8f0",
        padding: "20px 32px",
        display: "flex",
        justifyContent: "center",
      }}>
        {[
          { num: "5", label: "Open positions" },
          { num: "12", label: "Candidates" },
          { num: "842", label: "Registered voters" },
          { num: "73%", label: "Voted so far" },
        ].map(({ num, label }, i, arr) => (
          <div key={label} style={{
            textAlign: "center",
            padding: "0 36px",
            borderRight: i < arr.length - 1 ? "0.5px solid #e2e8f0" : "none",
          }}>
            <div style={{ fontSize: "22px", fontWeight: 500, color: "#1e293b" }}>{num}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Trust cards */}
      <div style={{ padding: "48px 32px", maxWidth: "860px", margin: "0 auto" }}>
        <p style={{ textAlign: "center", fontSize: "11px", fontWeight: 500, color: "#6366f1", letterSpacing: "0.08em", marginBottom: "8px" }}>
          WHY VOTE ONLINE
        </p>
        <h2 style={{ textAlign: "center", fontSize: "20px", fontWeight: 500, color: "#1e293b", margin: "0 0 32px" }}>
          Built for fair, transparent elections
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            { icon: "🔒", title: "Secure", desc: "Invite-only access. Only registered students can vote, verified by email." },
            { icon: "🗳️", title: "One vote per student", desc: "The system prevents duplicate votes at the database level — not just the UI." },
            { icon: "📊", title: "Live results", desc: "Results are published immediately after voting closes with full transparency." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: "#fff",
              border: "0.5px solid #e2e8f0",
              borderRadius: "12px",
              padding: "20px",
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "#eef2ff", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "18px", marginBottom: "12px",
              }}>
                {icon}
              </div>
              <div style={{ fontWeight: 500, fontSize: "14px", color: "#1e293b", marginBottom: "6px" }}>{title}</div>
              <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{
        background: "#6366f1",
        margin: "0 32px 48px",
        borderRadius: "16px",
        padding: "36px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: "796px",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        <div>
          <div style={{ color: "#e0e7ff", fontSize: "13px", marginBottom: "6px" }}>Ready to vote?</div>
          <div style={{ color: "#fff", fontSize: "20px", fontWeight: 500 }}>Your ballot is waiting for you.</div>
        </div>
        <button
          onClick={() => router.push("/auth/login")}
          style={{
            background: "#fff",
            color: "#4f46e5",
            border: "none",
            padding: "11px 28px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Sign in to vote →
        </button>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: "0.5px solid #e2e8f0",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1" }} />
          <span style={{ fontSize: "13px", color: "#64748b" }}>QuickVote</span>
        </div>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
          Nursing Department · {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}