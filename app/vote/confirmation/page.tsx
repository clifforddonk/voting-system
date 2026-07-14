"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConfirmationPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/vote");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "16px", padding: "56px 48px", maxWidth: "420px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>
          ✅
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 500, color: "#1e293b", margin: "0 0 10px" }}>
          Vote submitted!
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 8px", lineHeight: 1.6 }}>
          Your ballot has been recorded successfully.
        </p>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 24px", lineHeight: 1.6 }}>
          Results will be published once voting closes. Thank you for participating.
        </p>

        <div style={{ background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px", marginBottom: "24px" }}>
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
            🔒 Your vote is anonymous and has been securely recorded.
          </p>
        </div>

        {/* Countdown */}
        <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "20px" }}>
          Redirecting in {countdown}s...
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link
            href="/vote"
            style={{ display: "inline-block", background: "#f8fafc", color: "#64748b", border: "0.5px solid #e2e8f0", padding: "11px 24px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}
          >
            Home
          </Link>
          <Link
            href="/results"
            style={{ display: "inline-block", background: "#6366f1", color: "#fff", padding: "11px 24px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}
          >
            View results →
          </Link>
        </div>
      </div>
    </div>
  );
}