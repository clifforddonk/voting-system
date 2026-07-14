"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ActivatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div style={{ height: "3px", background: "linear-gradient(90deg, #5B6BF8, #4A5BE0, #3A4BC8)" }} />
        <div className="flex-1 flex items-center justify-center">
          <div
            className="rounded-2xl px-8 py-6 flex items-center gap-3 text-sm"
            style={{
              background: "rgba(255,80,80,0.08)",
              border: "1px solid rgba(255,120,120,0.25)",
              color: "#c0392b",
            }}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            Invalid or expired activation link.
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = schema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, confirmPassword }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push("/auth/login?activated=true");
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top accent bar */}
      <div style={{ height: "3px", background: "linear-gradient(90deg, #5B6BF8, #4A5BE0, #3A4BC8)" }} />

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: "#5B6BF8" }} />
          <span className="font-semibold tracking-wide text-sm" style={{ color: "#4A5BE0" }}>
            QuickVote
          </span>
        </div>
        <span className="text-xs font-medium tracking-widest uppercase text-gray-400">
          2024 / 2025
        </span>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Label pill */}
          <div className="flex justify-center mb-5">
            <span
              className="text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full"
              style={{ background: "#EEF0FE", color: "#4A5BE0" }}
            >
              Account Setup
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-center text-3xl font-bold mb-2 text-gray-800">
            Activate your account
          </h1>
          <p className="text-center text-sm mb-8 text-gray-400">
            Create a password to complete your registration.
          </p>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "linear-gradient(135deg, #5B6BF8 0%, #4A5BE0 50%, #3A4BC8 100%)",
              boxShadow: "0 20px 60px rgba(74, 91, 224, 0.35)",
            }}
          >
            <div className="space-y-5">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "white",
                  }}
                  placeholder="Min. 8 characters"
                  required
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.7)";
                    e.target.style.background = "rgba(255,255,255,0.22)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.25)";
                    e.target.style.background = "rgba(255,255,255,0.15)";
                  }}
                />
                {/* Password strength hint */}
                {password.length > 0 && (
                  <p className="text-xs mt-1.5" style={{ color: password.length >= 8 ? "rgba(180,255,180,0.85)" : "rgba(255,200,150,0.85)" }}>
                    {password.length >= 8 ? "✓ Strong enough" : `${8 - password.length} more character${8 - password.length !== 1 ? "s" : ""} needed`}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "white",
                  }}
                  placeholder="Repeat your password"
                  required
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.7)";
                    e.target.style.background = "rgba(255,255,255,0.22)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.25)";
                    e.target.style.background = "rgba(255,255,255,0.15)";
                  }}
                />
                {/* Match hint */}
                {confirmPassword.length > 0 && (
                  <p className="text-xs mt-1.5" style={{ color: password === confirmPassword ? "rgba(180,255,180,0.85)" : "rgba(255,200,150,0.85)" }}>
                    {password === confirmPassword ? "✓ Passwords match" : "Passwords don't match yet"}
                  </p>
                )}
              </div>

              {error && (
                <div
                  className="text-sm rounded-xl px-4 py-3 flex items-start gap-2"
                  style={{
                    background: "rgba(255,80,80,0.18)",
                    color: "#ffc0c0",
                    border: "1px solid rgba(255,120,120,0.3)",
                  }}
                >
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-all mt-1"
                style={{
                  background: loading ? "rgba(255,255,255,0.55)" : "white",
                  color: "#4A5BE0",
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 14px rgba(0,0,0,0.12)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.92)";
                }}
                onMouseLeave={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.background = "white";
                }}
              >
                {loading ? "Activating…" : "Activate Account →"}
              </button>
            </div>
          </div>

          {/* Footer hint */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Already activated?{" "}
            <a href="/auth/login" className="font-medium" style={{ color: "#4A5BE0" }}>
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}