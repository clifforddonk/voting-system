"use client";

import { useEffect, useState } from "react";
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
    if (!stored) {
      router.push("/vote");
      return;
    }
    setBallot(JSON.parse(stored));
  }, [router]);

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

    if (!res.ok) {
      setError(data.error);
      return;
    }

    sessionStorage.removeItem("ballot");
    router.push("/vote/confirmation");
  }

  if (!ballot) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <span className="text-sm font-medium text-slate-800">QuickVote</span>
        </div>
        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 sm:px-3">
          Review ballot
        </span>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-xl font-medium text-slate-800 sm:text-2xl">Review your ballot</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            Please check your selections carefully. Once submitted, your vote cannot be
            changed.
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {ballot.positions.map((position, index) => {
            const candidateId = ballot.selections[position._id];
            const candidate = ballot.candidates.find((item) => item._id === candidateId);
            return (
              <div
                key={position._id}
                className={`flex items-center justify-between gap-3 px-4 py-4 sm:px-5 ${
                  index < ballot.positions.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">{position.title}</p>
                  <p className="mt-1 truncate text-sm font-medium text-slate-800">
                    {candidate?.name}
                  </p>
                  {candidate?.studentId && (
                    <p className="mt-0.5 text-xs text-slate-400">{candidate.studentId}</p>
                  )}
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-medium text-indigo-500">
                  {candidate?.name.charAt(0)}
                </span>
              </div>
            );
          })}
        </section>

        <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <span aria-hidden="true">⚠️</span>
          <p className="text-xs leading-5 text-amber-800">
            This action is <strong>permanent</strong>. Once you submit your ballot it
            cannot be changed or undone. Make sure your selections are correct.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.push("/vote")}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 sm:flex-1"
          >
            ← Go back
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-[2]"
          >
            {submitting ? "Submitting..." : "Submit ballot"}
          </button>
        </div>
      </main>
    </div>
  );
}
