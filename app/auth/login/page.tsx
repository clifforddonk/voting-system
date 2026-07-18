"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activated = searchParams.get("activated");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password, or account not yet activated.");
      return;
    }

    let attempts = 0;
    let session: any = null;

    while (attempts < 8) {
      const sessionRes = await fetch("/api/auth/session", {
        cache: "no-store",
      });
      session = await sessionRes.json();

      if (session?.user?.email) {
        break;
      }

      attempts += 1;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    if (session?.user?.role === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/vote");
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Subtle top accent bar */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg, #5B6BF8, #4A5BE0, #3A4BC8)",
        }}
      />

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#5B6BF8" }}
          />
          <span
            className="font-semibold tracking-wide text-sm"
            style={{ color: "#4A5BE0" }}
          >
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
              Academic Year 2024 / 2025
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-center text-3xl font-bold mb-2 text-gray-800">
            Nursing Department Elections
          </h1>
          <p className="text-center text-sm mb-8 text-gray-400">
            Sign in to cast your vote. Every vote counts.
          </p>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background:
                "linear-gradient(135deg, #5B6BF8 0%, #4A5BE0 50%, #3A4BC8 100%)",
              boxShadow: "0 20px 60px rgba(74, 91, 224, 0.35)",
            }}
          >
            {activated && (
              <div
                className="text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Account activated! You can now sign in.
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition placeholder-white/40"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "white",
                  }}
                  placeholder="you@school.edu"
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
              </div>

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
                  <svg
                    className="w-4 h-4 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
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
                  if (!loading)
                    (e.target as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.92)";
                }}
                onMouseLeave={(e) => {
                  if (!loading)
                    (e.target as HTMLButtonElement).style.background = "white";
                }}
              >
                {loading ? "Signing in…" : "Sign in to vote →"}
              </button>
            </div>
          </div>

          {/* Footer hint */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Having trouble signing in?{" "}
            <span className="font-medium" style={{ color: "#4A5BE0" }}>
              Contact your department admin
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
