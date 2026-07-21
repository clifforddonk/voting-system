"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../adminPage.module.css";

type Election = {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "ended";
};

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  draft:  { bg: "#f1f5f9", color: "#64748b", label: "Draft" },
  active: { bg: "#dcfce7", color: "#166534", label: "Active" },
  ended:  { bg: "#fee2e2", color: "#991b1b", label: "Ended" },
};

export default function ElectionsPage() {
  const router = useRouter();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [extendingElection, setExtendingElection] = useState<Election | null>(null);
  const [extensionEndDate, setExtensionEndDate] = useState("");
  const [form, setForm] = useState({ title: "", description: "", startDate: "", endDate: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchElections() {
    const res = await fetch("/api/admin/elections");
    const data = await res.json();
    setElections(data.elections || []);
    setLoading(false);
  }

  useEffect(() => { fetchElections(); }, []);

  async function handleCreate() {
    setError("");
    if (!form.title || !form.startDate || !form.endDate) {
      setError("Title, start date and end date are required");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/elections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); return; }
    setShowCreate(false);
    setForm({ title: "", description: "", startDate: "", endDate: "" });
    fetchElections();
  }

  async function handleStatusChange(id: string, status: "active" | "ended") {
    await fetch(`/api/admin/elections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchElections();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this election? This cannot be undone.")) return;
    await fetch(`/api/admin/elections/${id}`, { method: "DELETE" });
    fetchElections();
  }

  async function handleExtend() {
    if (!extendingElection || !extensionEndDate) return;
    setError("");
    setSaving(true);
    const res = await fetch(`/api/admin/elections/${extendingElection._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endDate: extensionEndDate }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Unable to extend this election");
      return;
    }
    setExtendingElection(null);
    setExtensionEndDate("");
    fetchElections();
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: 500, color: "#1e293b", margin: "0 0 4px" }}>Elections</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Create and manage departmental elections</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className={styles.headerAction}
          style={{ background: "#6366f1", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
        >
          + New election
        </button>
      </div>

      {/* Elections list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>Loading...</div>
      ) : elections.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px", background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🗳️</div>
          <div style={{ fontSize: "14px", color: "#64748b" }}>No elections yet</div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Create your first election to get started</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {elections.map((election) => (
            <div key={election._id} className={styles.electionCard} style={{
              background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "12px", padding: "20px 24px",
            }}>
              <div className={styles.electionDetails}>
                <div className={styles.electionTitleRow} style={{ marginBottom: "6px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 500, color: "#1e293b" }}>{election.title}</span>
                  <span style={{
                    fontSize: "10px", fontWeight: 500, padding: "3px 10px", borderRadius: "20px",
                    background: statusStyle[election.status].bg,
                    color: statusStyle[election.status].color,
                  }}>
                    {statusStyle[election.status].label}
                  </span>
                </div>
                {election.description && (
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 6px" }}>{election.description}</p>
                )}
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  {new Date(election.startDate).toLocaleDateString()} → {new Date(election.endDate).toLocaleDateString()}
                </div>
              </div>

              <div className={styles.actions}>
                {/* Manage positions & candidates */}
                <button
                  onClick={() => router.push(`/admin/dashboard/elections/${election._id}`)}
                  style={{ background: "#f8fafc", border: "0.5px solid #e2e8f0", color: "#1e293b", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}
                >
                  Manage →
                </button>

                {/* Activate */}
                {election.status === "draft" && (
                  <button
                    onClick={() => handleStatusChange(election._id, "active")}
                    style={{ background: "#dcfce7", border: "none", color: "#166534", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                  >
                    Activate
                  </button>
                )}

                {/* End */}
                {election.status === "active" && (
                  <button
                    onClick={() => {
                      setError("");
                      setExtendingElection(election);
                      setExtensionEndDate("");
                    }}
                    style={{ background: "#eef2ff", border: "none", color: "#4338ca", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                  >
                    Extend time
                  </button>
                )}

                {election.status === "active" && (
                  <button
                    onClick={() => handleStatusChange(election._id, "ended")}
                    style={{ background: "#fee2e2", border: "none", color: "#991b1b", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                  >
                    End election
                  </button>
                )}

                {/* Delete — only drafts */}
                {election.status === "draft" && (
                  <button
                    onClick={() => handleDelete(election._id)}
                    style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer", padding: "4px 8px" }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal} style={{ background: "#fff", borderRadius: "16px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#1e293b", margin: 0 }}>New election</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>

            {[
              { label: "Election title", key: "title", type: "text", placeholder: "e.g. 2025/2026 Departmental Elections" },
              { label: "Description (optional)", key: "description", type: "text", placeholder: "Brief description" },
              { label: "Start date", key: "startDate", type: "datetime-local", placeholder: "" },
              { label: "End date", key: "endDate", type: "datetime-local", placeholder: "" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "5px" }}>{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", background: "#f8fafc", color: "#1e293b" }}
                />
              </div>
            ))}

            {error && <p style={{ color: "#dc2626", fontSize: "12px", marginBottom: "12px" }}>{error}</p>}

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "0.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "13px", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleCreate} disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#6366f1", color: "#fff", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                {saving ? "Creating..." : "Create election"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend-election modal */}
      {extendingElection && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal} style={{ background: "#fff", borderRadius: "16px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#1e293b", margin: 0 }}>Extend election time</h2>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>{extendingElection.title}</p>
              </div>
              <button onClick={() => setExtendingElection(null)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" }}>âœ•</button>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "5px" }}>New end date and time</label>
              <input
                type="datetime-local"
                value={extensionEndDate}
                onChange={(e) => setExtensionEndDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", background: "#f8fafc", color: "#1e293b" }}
              />
              <p style={{ fontSize: "11px", color: "#94a3b8", margin: "6px 0 0" }}>
                The new time must be later than the current deadline: {new Date(extendingElection.endDate).toLocaleString()}.
              </p>
            </div>

            {error && <p style={{ color: "#dc2626", fontSize: "12px", marginBottom: "12px" }}>{error}</p>}

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setExtendingElection(null)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "0.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleExtend} disabled={saving || !extensionEndDate} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#6366f1", color: "#fff", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                {saving ? "Extending..." : "Extend election"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
