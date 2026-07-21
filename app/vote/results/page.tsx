"use client";

import { useEffect, useState } from "react";
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
      const electionsResponse = await fetch("/api/elections/ended");
      const electionsData = await electionsResponse.json();
      const ended = electionsData.elections?.find(
        (item: Election) => item.status === "ended",
      );

      if (!ended) {
        setError("No results available yet.");
        setLoading(false);
        return;
      }

      const resultsResponse = await fetch(`/api/results/${ended._id}`);
      if (!resultsResponse.ok) {
        const data = await resultsResponse.json();
        setError(data.error || "Results not available");
        setLoading(false);
        return;
      }

      const data = await resultsResponse.json();
      setElection(data.election);
      setResults(data.results || []);
      setStats(data.stats || null);
      setLoading(false);
    }

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-400">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="text-4xl">📊</div>
          <p className="mt-3 text-sm text-slate-500">{error}</p>
          <button
            onClick={() => router.push("/vote")}
            className="mt-6 w-full rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
          >
            Back to home
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => router.push("/vote")}
            className="shrink-0 text-sm text-slate-500 transition-colors hover:text-slate-800"
          >
            ← Back
          </button>
          <span className="h-4 w-px bg-slate-200" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
            <span className="truncate text-sm font-medium text-slate-800">
              QuickVote
            </span>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-medium text-red-800 sm:px-3 sm:text-[11px]">
          Election closed
        </span>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl font-medium text-slate-800 sm:text-2xl">
            {election?.title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Final results · Closed{" "}
            {election?.endDate
              ? new Date(election.endDate).toLocaleDateString()
              : ""}
          </p>
        </div>

        {stats && (
          <section className="mb-6 grid grid-cols-1 gap-3 min-[400px]:grid-cols-3 sm:mb-8">
            {[
              { label: "Registered", value: stats.totalVoters },
              { label: "Voted", value: stats.totalVoted },
              { label: "Turnout", value: `${stats.turnout}%` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-white p-4 text-center"
              >
                <div className="text-xl font-medium text-slate-800 sm:text-2xl">
                  {value}
                </div>
                <div className="mt-1 text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </section>
        )}

        <div className="space-y-4">
          {results.map((result) => (
            <section
              key={result.position._id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <header className="flex flex-col gap-1 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <h2 className="text-sm font-medium text-slate-800">
                  {result.position.title}
                </h2>
                <span className="text-xs text-slate-400">
                  {result.totalVotes} votes
                </span>
              </header>
              <div className="space-y-4 p-4 sm:p-5">
                {result.candidates.map((candidate) => {
                  const isWinner =
                    result.winner?._id === candidate._id &&
                    result.totalVotes > 0;
                  return (
                    <div key={candidate._id}>
                      <div className="mb-2 flex items-start justify-between gap-3 text-sm">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          {isWinner && <span aria-label="Winner">🏆</span>}
                          <span
                            className={`break-words ${isWinner ? "font-semibold text-slate-900" : "text-slate-700"}`}
                          >
                            {candidate.name}
                          </span>
                          {isWinner && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800">
                              Winner
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 font-medium text-slate-800">
                          {candidate.percentage}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-[width] duration-700 ${isWinner ? "bg-indigo-500" : "bg-slate-300"}`}
                          style={{ width: `${candidate.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
