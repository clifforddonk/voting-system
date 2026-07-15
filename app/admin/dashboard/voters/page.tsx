"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { parseCSV } from "@/lib/parseCSV";

type Voter = {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
  level?: string;
  inviteStatus: "pending" | "invited" | "activated" | "voted";
};

type Stats = {
  total: number;
  pending: number;
  invited: number;
  activated: number;
  voted: number;
};

const LEVELS = ["all", "100", "200", "300", "400"] as const;
type Level = (typeof LEVELS)[number];

const emptyStats: Stats = {
  total: 0,
  pending: 0,
  invited: 0,
  activated: 0,
  voted: 0,
};

const statusColors: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#f1f5f9", color: "#64748b" },
  invited:   { bg: "#dbeafe", color: "#1e40af" },
  activated: { bg: "#dcfce7", color: "#166534" },
  voted:     { bg: "#ede9fe", color: "#5b21b6" },
};

export default function VotersPage() {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [activeLevel, setActiveLevel] = useState<Level>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [importLevel, setImportLevel] = useState<string>("100");
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<null | { imported: number; skipped: number; failed: number; errors: string[] }>(null);
  const [sendingLevel, setSendingLevel] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchVoters() {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeLevel !== "all") params.set("level", activeLevel);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/voters?${params}`);
    const data = await res.json();
    setVoters(data.voters || []);
    setStats({
      ...emptyStats,
      ...(data.stats || {}),
    });
    setLoading(false);
  }

  useEffect(() => { fetchVoters(); }, [activeLevel, search]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImportResult(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target?.result as string);
      setPreview(rows.slice(0, 5));
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setImporting(true);
    const text = await file.text();
    const voters = parseCSV(text);
    const res = await fetch("/api/admin/voters/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voters, level: importLevel }),
    });
    const data = await res.json();
    setImporting(false);
    setImportResult(data.results);
    fetchVoters();
  }

  async function handleSendInvites(level?: string) {
    setSendingLevel(level || "all");
    const res = await fetch("/api/admin/voters/send-invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level }),
    });
    const data = await res.json();
    setSendingLevel(null);
    alert(`✅ Sent ${data.sent} invite${data.sent !== 1 ? "s" : ""}`);
    fetchVoters();
  }

  const pendingCount = activeLevel === "all"
    ? stats.pending
    : voters.filter(v => v.inviteStatus === "pending").length;

  return (
    <div style={{ padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 500, color: "#1e293b", margin: "0 0 4px" }}>Voters</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Manage registered voters and send invitations</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {pendingCount > 0 && (
            <button
              onClick={() => handleSendInvites(activeLevel === "all" ? undefined : activeLevel)}
              disabled={!!sendingLevel}
              style={{
                background: "#fff",
                border: "0.5px solid #e2e8f0",
                color: "#1e293b",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {sendingLevel ? "Sending..." : `Send invites (${pendingCount} pending)`}
            </button>
          )}
          <button
            onClick={() => { setShowImport(true); setImportResult(null); setPreview([]); }}
            style={{
              background: "#6366f1",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            + Import voters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
        {[
          { label: "Total", value: stats.total, color: "#6366f1", bg: "#eef2ff" },
          { label: "Pending", value: stats.pending, color: "#64748b", bg: "#f1f5f9" },
          { label: "Invited", value: stats.invited, color: "#1e40af", bg: "#dbeafe" },
          { label: "Activated", value: stats.activated, color: "#166534", bg: "#dcfce7" },
  
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: bg, marginBottom: "10px" }} />
            <div style={{ fontSize: "22px", fontWeight: 500, color }}>{value}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Level tabs + search */}
      <div style={{
        background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "10px",
        overflow: "hidden", marginBottom: "0",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 16px", borderBottom: "0.5px solid #e2e8f0",
        }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  background: activeLevel === level ? "#6366f1" : "transparent",
                  color: activeLevel === level ? "#fff" : "#64748b",
                }}
              >
                {level === "all" ? "All levels" : `Level ${level}`}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search name, email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "7px 12px",
              border: "0.5px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
              width: "220px",
              background: "#f8fafc",
              color: "#1e293b",
            }}
          />
        </div>

        {/* Table */}
        <div>
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
            padding: "8px 16px", background: "#f8fafc", borderBottom: "0.5px solid #e2e8f0",
          }}>
            {["Name", "Email", "Student ID", "Level", "Status"].map((h) => (
              <span key={h} style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Loading...</div>
          ) : voters.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
              <div style={{ fontSize: "14px", color: "#64748b" }}>No voters found</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Import a CSV to get started</div>
            </div>
          ) : (
            voters.map((voter, i) => (
              <div key={voter._id} style={{
                display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
                padding: "11px 16px", borderBottom: i < voters.length - 1 ? "0.5px solid #f1f5f9" : "none",
                alignItems: "center",
              }}>
                <span style={{ fontSize: "13px", color: "#1e293b", fontWeight: 500 }}>{voter.name}</span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>{voter.email}</span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>{voter.studentId || "—"}</span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>{voter.level ? `Level ${voter.level}` : "—"}</span>
                <span>
                  <span style={{
                    display: "inline-block", fontSize: "10px", fontWeight: 500,
                    padding: "3px 10px", borderRadius: "20px",
                    background: statusColors[voter.inviteStatus]?.bg,
                    color: statusColors[voter.inviteStatus]?.color,
                    textTransform: "capitalize",
                  }}>
                    {voter.inviteStatus}
                  </span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Import modal */}
      {showImport && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "28px",
            width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#1e293b", margin: 0 }}>Import voters</h2>
              <button onClick={() => setShowImport(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>

            {/* Level selector */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#475569", display: "block", marginBottom: "6px" }}>
                Which level is this CSV for?
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["100", "200", "300", "400"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setImportLevel(l)}
                    style={{
                      flex: 1, padding: "8px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                      border: importLevel === l ? "2px solid #6366f1" : "0.5px solid #e2e8f0",
                      background: importLevel === l ? "#eef2ff" : "#fff",
                      color: importLevel === l ? "#6366f1" : "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    Level {l}
                  </button>
                ))}
              </div>
            </div>

            {/* File upload */}
            <div style={{
              border: "1.5px dashed #e2e8f0", borderRadius: "10px",
              padding: "28px", textAlign: "center", marginBottom: "16px", background: "#f8fafc",
            }}>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} style={{ display: "none" }} id="csv-input" />
              <label htmlFor="csv-input" style={{ cursor: "pointer", color: "#6366f1", fontSize: "13px", fontWeight: 500 }}>
                Click to upload CSV
              </label>
              <p style={{ color: "#94a3b8", fontSize: "11px", marginTop: "4px" }}>
                Columns: name, email, studentId
              </p>
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>Preview (first 5 rows)</p>
                <div style={{ border: "0.5px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", padding: "8px 12px", background: "#f8fafc", borderBottom: "0.5px solid #e2e8f0" }}>
                    {Object.keys(preview[0]).map((h) => (
                      <span key={h} style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>{h}</span>
                    ))}
                  </div>
                  {preview.map((row, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", padding: "8px 12px", borderBottom: i < preview.length - 1 ? "0.5px solid #f1f5f9" : "none" }}>
                      {Object.values(row).map((val, j) => (
                        <span key={j} style={{ fontSize: "12px", color: "#334155" }}>{val}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Import result */}
            {importResult && (
              <div style={{ background: "#f0fdf4", border: "0.5px solid #bbf7d0", borderRadius: "8px", padding: "14px", marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "20px", marginBottom: importResult.errors.length > 0 ? "10px" : "0" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 500, color: "#166534" }}>{importResult.imported}</div>
                    <div style={{ fontSize: "11px", color: "#166534" }}>Imported</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 500, color: "#854d0e" }}>{importResult.skipped}</div>
                    <div style={{ fontSize: "11px", color: "#854d0e" }}>Skipped</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: 500, color: "#991b1b" }}>{importResult.failed}</div>
                    <div style={{ fontSize: "11px", color: "#991b1b" }}>Failed</div>
                  </div>
                </div>
                {importResult.errors.map((e, i) => (
                  <p key={i} style={{ fontSize: "11px", color: "#dc2626", margin: "2px 0" }}>• {e}</p>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setShowImport(false)}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "0.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "13px", cursor: "pointer" }}
              >
                Cancel
              </button>
              {preview.length > 0 && !importResult && (
                <button
                  onClick={handleImport}
                  disabled={importing}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#6366f1", color: "#fff", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                >
                  {importing ? "Importing..." : `Import to Level ${importLevel}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}