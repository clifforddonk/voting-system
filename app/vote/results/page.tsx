"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type CandidateResult = {
  _id: string;
  name: string;
  studentId?: string;
  votes: number;
  percentage: number;
};
type PositionResult = {
  position: { _id: string; title: string };
  candidates: CandidateResult[];
  winner: CandidateResult | null;
  totalVotes: number;
};
type Stats = { totalVoters: number; totalVoted: number; turnout: number };
type Election = { _id: string; title: string; status: string; endDate: string };

export default function PublicResultsPage() {
  const router = useRouter();
  const [election, setElection] = useState<Election | null>(null);
  const [results, setResults] = useState<PositionResult[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchResults() {
      // Find most recently ended election
      const elRes = await fetch("/api/elections/ended");
      const elData = await elRes.json();
      const ended = elData.elections?.find(
        (e: Election) => e.status === "ended",
      );

      if (!ended) {
        setError("No results available yet.");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/results/${ended._id}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Results not available");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setElection(data.election);
      setResults(data.results || []);
      setStats(data.stats || null);
      setLoading(false);
    }
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
        <p style={{ color: "#94a3b8" }}>Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📊</div>
          <p style={{ color: "#64748b", fontSize: "14px" }}>{error}</p>
          <button
            onClick={() => router.push("/")}
            style={{
              marginTop: "16px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              padding: "10px 24px",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Topbar */}
      <div
        style={{
          background: "#fff",
          borderBottom: "0.5px solid #e2e8f0",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => router.push("/vote")}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: "13px",
              cursor: "pointer",
              padding: "0",
            }}
          >
            ← Back
          </button>
          <div
            style={{ width: "0.5px", height: "16px", background: "#e2e8f0" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#6366f1",
              }}
            />
            <span
              style={{ fontWeight: 500, fontSize: "14px", color: "#1e293b" }}
            >
              QuickVote
            </span>
          </div>
        </div>
        <span
          style={{
            fontSize: "11px",
            background: "#fee2e2",
            color: "#991b1b",
            padding: "4px 12px",
            borderRadius: "20px",
            fontWeight: 500,
          }}
        >
          Election Closed
        </span>
      </div>

      <div
        style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px" }}
      >
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 500,
              color: "#1e293b",
              margin: "0 0 6px",
            }}
          >
            {election?.title}
          </h1>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
            Final results · Closed{" "}
            {election?.endDate
              ? new Date(election.endDate).toLocaleDateString()
              : ""}
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginBottom: "28px",
            }}
          >
            {[
              { label: "Registered", value: stats.totalVoters },
              { label: "Voted", value: stats.totalVoted },
              { label: "Turnout", value: `${stats.turnout}%` },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "#fff",
                  border: "0.5px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 500,
                    color: "#1e293b",
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    marginTop: "2px",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {results.map((result) => (
            <div
              key={result.position._id}
              style={{
                background: "#fff",
                border: "0.5px solid #e2e8f0",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "0.5px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#1e293b",
                  }}
                >
                  {result.position.title}
                </span>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {result.totalVotes} votes
                </span>
              </div>
              <div
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {result.candidates.map((candidate) => {
                  const isWinner =
                    result.winner?._id === candidate._id &&
                    result.totalVotes > 0;
                  return (
                    <div key={candidate._id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {isWinner && <span>🏆</span>}
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: isWinner ? 600 : 400,
                              color: "#1e293b",
                            }}
                          >
                            {candidate.name}
                          </span>
                          {isWinner && (
                            <span
                              style={{
                                fontSize: "10px",
                                background: "#dcfce7",
                                color: "#166534",
                                padding: "2px 8px",
                                borderRadius: "20px",
                                fontWeight: 500,
                              }}
                            >
                              Winner
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#1e293b",
                          }}
                        >
                          {candidate.percentage}%
                        </span>
                      </div>
                      <div
                        style={{
                          background: "#f1f5f9",
                          borderRadius: "4px",
                          height: "8px",
                        }}
                      >
                        <div
                          style={{
                            background: isWinner ? "#6366f1" : "#cbd5e1",
                            height: "8px",
                            width: `${candidate.percentage}%`,
                            borderRadius: "4px",
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
