"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Position = { _id: string; title: string };
type Candidate = { _id: string; name: string; studentId?: string; positionId: string };

type Ballot = {
  electionId: string;
  electionTitle: string;
  selections: Record<string, string>;
  positions: Position[];
  candidates: Candidate[];
};

export default function ReviewPage() {
  const router = useRouter();
  const [ballot, setBallot] = useState<Ballot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("ballot");
    if (!stored) { router.push("/vote"); return; }
    setBallot(JSON.parse(stored));
  }, []);

  async function handleSubmit() {
    if (!ballot) return;
    setSubmitting(true);
    setError("");

    const votes = Object.entries(ballot.selections).map(([positionId, candidateId]) => ({
      positionId,
      candidateId,
    }));

    const res = await fetch("/api/vote/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ electionId: ballot.electionId, votes }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) { setError(data.error); return; }

    sessionStorage.removeItem("ballot");
    router.push("/vote/confirmation");
  }

  if (!ballot) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "0.5px solid #e2e8f0", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1" }} />
          <span style={{ fontWeight: 500, fontSize: "14px", color: "#1e293b" }}>QuickVote</span>
        </div>
        <span style={{ fontSize: "12px", background: "#fef9c3", color: "#854d0e", padding: "4px 12px", borderRadius: "20px", fontWeight: 500 }}>
          Review your ballot
        </span>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 24px" }}>

        <div style={{ marginBottom: "28px", textAlign: "center" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 500, color: "#1e293b", margin: "0 0 8px" }}>Review your ballot</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Please check your selections carefully. Once submitted your vote cannot be changed.
          </p>
        </div>

        {/* Selections summary */}
        <div style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", marginBottom: "24px" }}>
          {ballot.positions.map((position, i) => {
            const candidateId = ballot.selections[position._id];
            const candidate = ballot.candidates.find(c => c._id === candidateId);
            return (
              <div key={position._id} style={{
                padding: "16px 20px",
                borderBottom: i < ballot.positions.length - 1 ? "0.5px solid #f1f5f9" : "none",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "3px", fontWeight: 500 }}>{position.title}</div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#1e293b" }}>{candidate?.name}</div>
                  {candidate?.studentId && <div style={{ fontSize: "11px", color: "#94a3b8" }}>{candidate.studentId}</div>}
                </div>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 500, fontSize: "13px" }}>
                  {candidate?.name.charAt(0)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning */}
        <div style={{ background: "#fef9c3", border: "0.5px solid #fde68a", borderRadius: "10px", padding: "14px 16px", marginBottom: "24px", display: "flex", gap: "10px" }}>
          <span style={{ fontSize: "16px" }}>⚠️</span>
          <p style={{ fontSize: "12px", color: "#854d0e", margin: 0, lineHeight: 1.6 }}>
            This action is <strong>permanent</strong>. Once you submit your ballot it cannot be changed or undone. Make sure your selections are correct.
          </p>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", border: "0.5px solid #fecaca", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" }}>
            <p style={{ fontSize: "13px", color: "#991b1b", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => router.push("/vote")}
            style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "0.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "14px", cursor: "pointer" }}
          >
            ← Go back
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ flex: 2, padding: "12px", borderRadius: "8px", border: "none", background: "#6366f1", color: "#fff", fontSize: "14px", fontWeight: 500, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Submitting..." : "Submit ballot"}
          </button>
        </div>
      </div>
    </div>
  );
}