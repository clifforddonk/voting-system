"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type Election = { _id: string; title: string; endDate: string };
type Position = { _id: string; title: string; description?: string };
type Candidate = { _id: string; name: string; studentId?: string; manifesto?: string; positionId: string };

export default function VotePage() {
  const router = useRouter();
  const [election, setElection] = useState<Election | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchElection() {
      const res = await fetch("/api/vote/election");
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "No active election found");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setElection(data.election);
      setPositions(data.positions);
      setCandidates(data.candidates);
      setHasVoted(data.hasVoted);
      setLoading(false);
    }
    fetchElection();
  }, []);

  function handleSelect(positionId: string, candidateId: string) {
    setSelections((prev) => ({ ...prev, [positionId]: candidateId }));
  }

  const totalPositions = positions.length;
  const totalSelected = Object.keys(selections).length;
  const allSelected = totalSelected === totalPositions && totalPositions > 0;
  const progress = totalPositions > 0 ? (totalSelected / totalPositions) * 100 : 0;

  function handleReview() {
    // Store selections in sessionStorage for review page
    sessionStorage.setItem("ballot", JSON.stringify({
      electionId: election?._id,
      selections,
      positions,
      candidates,
      electionTitle: election?.title,
    }));
    router.push("/vote/review");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading your ballot...</p>
      </div>
    );
  }

if (error) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "0.5px solid #e2e8f0", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1" }} />
            <span style={{ fontWeight: 500, fontSize: "14px", color: "#1e293b" }}>QuickVote</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{ background: "none", border: "0.5px solid #e2e8f0", color: "#64748b", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>

      <div style={{ maxWidth: "480px", margin: "80px auto", padding: "0 24px" }}>
        <div style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗳️</div>
          <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#1e293b", margin: "0 0 8px" }}>
            No election running
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 28px", lineHeight: 1.6 }}>
            There is no active election at the moment. Check back later or view past results below.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => router.push("/vote/results")}
              style={{ width: "100%", background: "#6366f1", color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
            >
              View past results →
            </button>
            {/* <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{ width: "100%", background: "#f8fafc", color: "#64748b", border: "0.5px solid #e2e8f0", padding: "12px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}
            >
              Sign out
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

 if (hasVoted) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "0.5px solid #e2e8f0", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1" }} />
          <span style={{ fontWeight: 500, fontSize: "14px", color: "#1e293b" }}>QuickVote</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{ background: "none", border: "0.5px solid #e2e8f0", color: "#64748b", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>

      <div style={{ maxWidth: "480px", margin: "80px auto", padding: "0 24px" }}>
        <div style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "16px", padding: "40px", textAlign: "center" }}>

          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>
            ✅
          </div>

          <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#1e293b", margin: "0 0 8px" }}>
            Your vote has been recorded
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 6px", lineHeight: 1.6 }}>
            You have already cast your ballot for
          </p>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "#1e293b", margin: "0 0 28px" }}>
            {election?.title}
          </p>

          <div style={{ background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px", marginBottom: "24px" }}>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
              🔒 Your vote is anonymous and cannot be changed.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => router.push("/vote/results")}
              style={{ width: "100%", background: "#6366f1", color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
            >
              View results →
            </button>
            {/* <button
              onClick={() => router.push("/")}
              style={{ width: "100%", background: "#f8fafc", color: "#64748b", border: "0.5px solid #e2e8f0", padding: "12px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}
            >
              Back to home
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "0.5px solid #e2e8f0", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1" }} />
          <span style={{ fontWeight: 500, fontSize: "14px", color: "#1e293b" }}>QuickVote</span>
        </div>
        <div style={{ fontSize: "12px", color: "#64748b" }}>
          {totalSelected} of {totalPositions} positions selected
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: "#e2e8f0", height: "3px" }}>
        <div style={{ background: "#6366f1", height: "3px", width: `${progress}%`, transition: "width 0.3s ease" }} />
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Election title */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 500, color: "#1e293b", margin: "0 0 6px" }}>{election?.title}</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Select one candidate for each position. You cannot change your vote after submitting.
          </p>
        </div>

        {/* Positions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {positions.map((position, index) => {
            const positionCandidates = candidates.filter(c => c.positionId === position._id);
            const selected = selections[position._id];

            return (
              <div key={position._id} style={{
                background: "#fff",
                border: selected ? "1.5px solid #6366f1" : "0.5px solid #e2e8f0",
                borderRadius: "12px",
                overflow: "hidden",
                transition: "border 0.2s ease",
              }}>
                {/* Position header */}
                <div style={{ padding: "16px 20px", borderBottom: "0.5px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: selected ? "#6366f1" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 500, color: selected ? "#fff" : "#94a3b8", flexShrink: 0 }}>
                      {selected ? "✓" : index + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "#1e293b" }}>{position.title}</div>
                      {position.description && <div style={{ fontSize: "11px", color: "#94a3b8" }}>{position.description}</div>}
                    </div>
                  </div>
                  {!selected && (
                    <span style={{ fontSize: "11px", color: "#f59e0b", background: "#fef9c3", padding: "3px 10px", borderRadius: "20px", fontWeight: 500 }}>
                      Select one
                    </span>
                  )}
                </div>

                {/* Candidates grid */}
                <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
                  {positionCandidates.map((candidate) => {
                    const isSelected = selected === candidate._id;
                    return (
                      <div
                        key={candidate._id}
                        onClick={() => handleSelect(position._id, candidate._id)}
                        style={{
                          border: isSelected ? "2px solid #6366f1" : "0.5px solid #e2e8f0",
                          borderRadius: "10px",
                          padding: "14px 12px",
                          textAlign: "center",
                          cursor: "pointer",
                          background: isSelected ? "#eef2ff" : "#f8fafc",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "50%",
                          background: isSelected ? "#6366f1" : "#e2e8f0",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          margin: "0 auto 8px",
                          fontSize: "14px", fontWeight: 500,
                          color: isSelected ? "#fff" : "#64748b",
                        }}>
                          {candidate.name.charAt(0)}
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#1e293b" }}>{candidate.name}</div>
                        {candidate.studentId && (
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{candidate.studentId}</div>
                        )}
                        {candidate.manifesto && (
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", lineHeight: 1.5 }}>
                            "{candidate.manifesto}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Review button */}
        <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}>
          {!allSelected && (
            <p style={{ fontSize: "12px", color: "#94a3b8", marginRight: "16px", alignSelf: "center" }}>
              {totalPositions - totalSelected} position{totalPositions - totalSelected !== 1 ? "s" : ""} remaining
            </p>
          )}
          <button
            onClick={handleReview}
            disabled={!allSelected}
            style={{
              background: allSelected ? "#6366f1" : "#e2e8f0",
              color: allSelected ? "#fff" : "#94a3b8",
              border: "none",
              padding: "12px 32px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: allSelected ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
            }}
          >
            Review ballot →
          </button>
        </div>
      </div>
    </div>
  );
}