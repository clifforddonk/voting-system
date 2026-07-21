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
  pending: { bg: "#f1f5f9", color: "#64748b" },
  invited: { bg: "#dbeafe", color: "#1e40af" },
  activated: { bg: "#dcfce7", color: "#166534" },
  voted: { bg: "#ede9fe", color: "#5b21b6" },
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

  useEffect(() => {
    fetchVoters();
  }, [activeLevel, search]);

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

  const pendingCount = activeLevel === "all" ? stats.pending : voters.filter((v) => v.inviteStatus === "pending").length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Voters</h1>
          <p className="text-sm text-slate-500">Manage registered voters and send invitations</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {pendingCount > 0 && (
            <button
              onClick={() => handleSendInvites(activeLevel === "all" ? undefined : activeLevel)}
              disabled={!!sendingLevel}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-70"
            >
              {sendingLevel ? "Sending..." : `Send invites (${pendingCount} pending)`}
            </button>
          )}
          <button
            onClick={() => {
              setShowImport(true);
              setImportResult(null);
              setPreview([]);
            }}
            className="rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + Import voters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total", value: stats.total, color: "#6366f1", bg: "#eef2ff" },
          { label: "Pending", value: stats.pending, color: "#64748b", bg: "#f1f5f9" },
          { label: "Invited", value: stats.invited, color: "#1e40af", bg: "#dbeafe" },
          { label: "Activated", value: stats.activated, color: "#166534", bg: "#dcfce7" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 h-7 w-7 rounded-lg" style={{ background: bg }} />
            <div className="text-2xl font-semibold" style={{ color }}>
              {value}
            </div>
            <div className="mt-1 text-sm text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  activeLevel === level ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
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
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 sm:w-64"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
        ) : voters.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mb-2 text-3xl">📭</div>
            <div className="text-sm font-medium text-slate-700">No voters found</div>
            <div className="mt-1 text-sm text-slate-500">Import a CSV to get started</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {voters.map((voter) => (
              <div key={voter._id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800">{voter.name}</div>
                  <div className="text-sm text-slate-500">{voter.email}</div>
                  {/* <div className="mt-1 text-xs text-slate-400">
                    {voter.studentId ? `ID: ${voter.studentId}` : "No student ID"} • {voter.level ? `Level ${voter.level}` : "Level unknown"}
                  </div> */}
                </div>
                <span
                  className="inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{
                    background: statusColors[voter.inviteStatus]?.bg,
                    color: statusColors[voter.inviteStatus]?.color,
                  }}
                >
                  {voter.inviteStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showImport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Import voters</h2>
              <button onClick={() => setShowImport(false)} className="text-lg text-slate-400 transition hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Which level is this CSV for?
              </label>
              <div className="flex flex-wrap gap-2">
                {["100", "200", "300", "400"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setImportLevel(l)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                      importLevel === l ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    Level {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csv-input" />
              <label htmlFor="csv-input" className="cursor-pointer text-sm font-semibold text-indigo-600">
                Click to upload CSV
              </label>
              <p className="mt-1 text-xs text-slate-400">Columns: name, email, studentId</p>
            </div>

            {preview.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm text-slate-600">Preview (first 5 rows)</p>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="grid grid-cols-3 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {Object.keys(preview[0]).map((h) => (
                      <span key={h}>{h}</span>
                    ))}
                  </div>
                  {preview.map((row, i) => (
                    <div key={i} className="grid grid-cols-3 border-t border-slate-100 px-3 py-2 text-sm text-slate-600">
                      {Object.values(row).map((val, j) => (
                        <span key={j}>{val}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-emerald-700">{importResult.imported}</div>
                    <div className="text-xs text-emerald-700">Imported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-amber-700">{importResult.skipped}</div>
                    <div className="text-xs text-amber-700">Skipped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-rose-700">{importResult.failed}</div>
                    <div className="text-xs text-rose-700">Failed</div>
                  </div>
                </div>
                {importResult.errors.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {importResult.errors.map((error, index) => (
                      <li key={`${error}-${index}`}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => setShowImport(false)} className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600">
                Close
              </button>
              <button onClick={handleImport} disabled={importing} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70">
                {importing ? "Importing..." : "Import CSV"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
             