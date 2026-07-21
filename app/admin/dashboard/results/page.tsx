"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import styles from "../adminPage.module.css";

type Election = { _id: string; title: string; status: string };
type CandidateResult = { _id: string; name: string; studentId?: string; votes: number; percentage: number };
type PositionResult = { position: { _id: string; title: string }; candidates: CandidateResult[]; winner: CandidateResult | null; totalVotes: number };
type Stats = { totalVoters: number; totalVoted: number; turnout: number };

export default function ResultsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [results, setResults] = useState<PositionResult[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [electionInfo, setElectionInfo] = useState<Election | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/elections")
      .then((r) => r.json())
      .then((d) => {
        setElections(d.elections || []);
        // Auto-select active or most recent
        const active = d.elections?.find((e: Election) => e.status === "active");
        const first = d.elections?.[0];
        if (active || first) setSelectedId((active || first)._id);
      });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    fetch(`/api/results/${selectedId}`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d.results || []);
        setStats(d.stats || null);
        setElectionInfo(d.election || null);
        setLoading(false);
      });
  }, [selectedId]);

  const statusStyle: Record<string, { bg: string; color: string }> = {
    draft:  { bg: "#f1f5f9", color: "#64748b" },
    active: { bg: "#dcfce7", color: "#166534" },
    ended:  { bg: "#fee2e2", color: "#991b1b" },
  };

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 500, color: "#1e293b", margin: "0 0 4px" }}>Results</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>View election results and vote counts</p>
        </div>

        {/* Election selector */}
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className={styles.electionSelector}
          style={{ padding: "8px 12px", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", background: "#fff", color: "#1e293b", cursor: "pointer" }}
        >
          {elections.map((e) => (
            <option key={e._id} value={e._id}>{e.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "64px", color: "#94a3b8" }}>Loading results...</div>
      ) : (
        <>
          {/* Stats row */}
          {stats && (
            <div className={styles.statsGrid}>
              {[
                { label: "Registered voters", value: stats.totalVoters, color: "#6366f1", bg: "#eef2ff" },
                { label: "Votes cast", value: stats.totalVoted, color: "#166534", bg: "#dcfce7" },
                { label: "Voter turnout", value: `${stats.turnout}%`, color: "#854d0e", bg: "#fef9c3" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "16px 20px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: bg, marginBottom: "10px" }} />
                  <div style={{ fontSize: "24px", fontWeight: 500, color }}>{value}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Election status notice */}
          {electionInfo && electionInfo.status === "active" && (
            <div style={{ background: "#dbeafe", border: "0.5px solid #bfdbfe", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
              <span>ℹ️</span>
              <span style={{ fontSize: "13px", color: "#1e40af" }}>This election is still active. Results shown are live and may change as more votes come in.</span>
            </div>
          )}

          {/* Results per position */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {results.map((result) => (
              <div key={result.position._id} style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>

                {/* Position header */}
                <div className={styles.resultHeader} style={{ padding: "16px 20px", borderBottom: "0.5px solid #f1f5f9" }}>
                  <span style={{ fontSize: "15px", fontWeight: 500, color: "#1e293b" }}>{result.position.title}</span>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{result.totalVotes} votes cast</span>
                </div>

                {/* Candidates */}
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {result.candidates.map((candidate, i) => {
                    const isWinner = result.winner?._id === candidate._id && result.totalVotes > 0;
                    return (
                      <div key={candidate._id}>
                        <div className={styles.candidateRow} style={{ marginBottom: "6px" }}>
                          <div className={styles.candidateDetails}>
                            {isWinner && (
                              <span style={{ fontSize: "14px" }}>🏆</span>
                            )}
                            <div className={styles.candidateIdentity}>
                              <span style={{ fontSize: "13px", fontWeight: isWinner ? 600 : 400, color: "#1e293b" }}>
                                {candidate.name}
                              </span>
                              {candidate.studentId && (
                                <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "8px" }}>{candidate.studentId}</span>
                              )}
                            </div>
                            {isWinner && (
                              <span style={{ fontSize: "10px", fontWeight: 500, background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "20px" }}>
                                Winner
                              </span>
                            )}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "14px", fontWeight: 500, color: "#1e293b" }}>{candidate.votes}</span>
                            <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "4px" }}>({candidate.percentage}%)</span>
                          </div>
                        </div>

                        {/* Bar */}
                        <div style={{ background: "#f1f5f9", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                          <div style={{
                            background: isWinner ? "#6366f1" : "#cbd5e1",
                            height: "8px",
                            width: `${candidate.percentage}%`,
                            borderRadius: "4px",
                            transition: "width 0.6s ease",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
