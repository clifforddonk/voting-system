"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

type Position = { _id: string; title: string; description?: string; order: number };
type Candidate = { _id: string; name: string; studentId?: string; manifesto?: string; positionId: string };

export default function ElectionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [positionForm, setPositionForm] = useState({ title: "", description: "" });
  const [candidateForm, setCandidateForm] = useState({ name: "", studentId: "", manifesto: "", positionId: "" });
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    const [posRes, canRes] = await Promise.all([
      fetch(`/api/admin/elections/${id}/positions`),
      fetch(`/api/admin/elections/${id}/candidates`),
    ]);
    const [posData, canData] = await Promise.all([posRes.json(), canRes.json()]);
    setPositions(posData.positions || []);
    setCandidates(canData.candidates || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [id]);

  async function handleAddPosition() {
    if (!positionForm.title) return;
    setSaving(true);
    await fetch(`/api/admin/elections/${id}/positions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...positionForm, order: positions.length }),
    });
    setSaving(false);
    setShowAddPosition(false);
    setPositionForm({ title: "", description: "" });
    fetchData();
  }

  async function handleDeletePosition(positionId: string) {
    if (!confirm("Delete this position and all its candidates?")) return;
    await fetch(`/api/admin/elections/${id}/positions/${positionId}`, { method: "DELETE" });
    fetchData();
  }

  async function handleAddCandidate() {
    if (!candidateForm.name || !candidateForm.positionId) return;
    setSaving(true);
    await fetch(`/api/admin/elections/${id}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(candidateForm),
    });
    setSaving(false);
    setShowAddCandidate(false);
    setCandidateForm({ name: "", studentId: "", manifesto: "", positionId: "" });
    fetchData();
  }

  async function handleDeleteCandidate(candidateId: string) {
    if (!confirm("Remove this candidate?")) return;
    await fetch(`/api/admin/elections/${id}/candidates/${candidateId}`, { method: "DELETE" });
    fetchData();
  }

  return (
    <div style={{ padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => router.push("/admin/dashboard/elections")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "13px" }}>
            ← Elections
          </button>
          <span style={{ color: "#e2e8f0" }}>|</span>
          <h1 style={{ fontSize: "18px", fontWeight: 500, color: "#1e293b", margin: 0 }}>Manage Election</h1>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => { setShowAddCandidate(true); setCandidateForm({ name: "", studentId: "", manifesto: "", positionId: selectedPositionId }); }}
            style={{ background: "#fff", border: "0.5px solid #e2e8f0", color: "#1e293b", padding: "8px 14px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}
          >
            + Add candidate
          </button>
          <button
            onClick={() => setShowAddPosition(true)}
            style={{ background: "#6366f1", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
          >
            + Add position
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>Loading...</div>
      ) : positions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px", background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
          <div style={{ fontSize: "14px", color: "#64748b" }}>No positions yet</div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Add positions like President, VP, Secretary</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {positions.map((position) => {
            const positionCandidates = candidates.filter(c => c.positionId === position._id);
            return (
              <div key={position._id} style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                {/* Position header */}
                <div style={{ padding: "16px 20px", borderBottom: "0.5px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#1e293b" }}>{position.title}</span>
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>{positionCandidates.length} candidate{positionCandidates.length !== 1 ? "s" : ""}</span>
                    </div>
                    {position.description && <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>{position.description}</p>}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => { setSelectedPositionId(position._id); setShowAddCandidate(true); setCandidateForm({ name: "", studentId: "", manifesto: "", positionId: position._id }); }}
                      style={{ background: "#eef2ff", border: "none", color: "#6366f1", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                    >
                      + Candidate
                    </button>
                    <button
                      onClick={() => handleDeletePosition(position._id)}
                      style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px", padding: "4px 8px" }}
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Candidates */}
                {positionCandidates.length === 0 ? (
                  <div style={{ padding: "16px 20px", fontSize: "12px", color: "#94a3b8" }}>No candidates yet</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", padding: "16px 20px" }}>
                    {positionCandidates.map((candidate) => (
                      <div key={candidate._id} style={{ border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "14px", background: "#f8fafc", position: "relative" }}>
                        <button
                          onClick={() => handleDeleteCandidate(candidate._id)}
                          style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: "14px" }}
                        >
                          ×
                        </button>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 500, fontSize: "13px", marginBottom: "8px" }}>
                          {candidate.name.charAt(0)}
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#1e293b" }}>{candidate.name}</div>
                        {candidate.studentId && <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{candidate.studentId}</div>}
                        {candidate.manifesto && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", lineHeight: 1.5 }}>{candidate.manifesto}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add position modal */}
      {showAddPosition && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#1e293b", margin: 0 }}>Add position</h2>
              <button onClick={() => setShowAddPosition(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>
            {[
              { label: "Position title", key: "title", placeholder: "e.g. President" },
              { label: "Description (optional)", key: "description", placeholder: "Brief description" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "5px" }}>{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={positionForm[key as keyof typeof positionForm]}
                  onChange={(e) => setPositionForm({ ...positionForm, [key]: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", background: "#f8fafc", color: "#1e293b" }}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <button onClick={() => setShowAddPosition(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "0.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAddPosition} disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#6366f1", color: "#fff", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                {saving ? "Saving..." : "Add position"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add candidate modal */}
      {showAddCandidate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#1e293b", margin: 0 }}>Add candidate</h2>
              <button onClick={() => setShowAddCandidate(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "5px" }}>Position</label>
              <select
                value={candidateForm.positionId}
                onChange={(e) => setCandidateForm({ ...candidateForm, positionId: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", background: "#f8fafc", color: "#1e293b" }}
              >
                <option value="">Select a position</option>
                {positions.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>

            {[
              { label: "Full name", key: "name", placeholder: "Candidate's full name" },
              { label: "Student ID (optional)", key: "studentId", placeholder: "e.g. NUR001" },
              { label: "Manifesto (optional)", key: "manifesto", placeholder: "Brief manifesto or tagline" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "5px" }}>{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={candidateForm[key as keyof typeof candidateForm]}
                  onChange={(e) => setCandidateForm({ ...candidateForm, [key]: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", background: "#f8fafc", color: "#1e293b" }}
                />
              </div>
            ))}

            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <button onClick={() => setShowAddCandidate(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "0.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAddCandidate} disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#6366f1", color: "#fff", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                {saving ? "Saving..." : "Add candidate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}