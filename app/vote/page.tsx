"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type Election = { _id: string; title: string; endDate: string };
type Position = { _id: string; title: string; description?: string };
type Candidate = {
  _id: string;
  name: string;
  studentId?: string;
  manifesto?: string;
  positionId: string;
};

function Topbar({ progressText }: { progressText?: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
        <span className="text-sm font-medium text-slate-800">QuickVote</span>
      </div>
      {progressText ? (
        <span className="text-right text-xs text-slate-500">{progressText}</span>
      ) : (
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-50"
        >
          Sign out
        </button>
      )}
    </header>
  );
}

function StatusPage({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />
      <main className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-20">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mb-4 text-4xl sm:text-5xl">{icon}</div>
          <h1 className="text-lg font-medium text-slate-800">{title}</h1>
          {children}
        </section>
      </main>
    </div>
  );
}

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
    setSelections((previous) => ({ ...previous, [positionId]: candidateId }));
  }

  const totalPositions = positions.length;
  const totalSelected = Object.keys(selections).length;
  const allSelected = totalSelected === totalPositions && totalPositions > 0;
  const progress = totalPositions > 0 ? (totalSelected / totalPositions) * 100 : 0;

  function handleReview() {
    sessionStorage.setItem(
      "ballot",
      JSON.stringify({
        electionId: election?._id,
        selections,
        positions,
        candidates,
        electionTitle: election?.title,
      }),
    );
    router.push("/vote/review");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-400">Loading your ballot...</p>
      </div>
    );
  }

  if (error) {
    return (
      <StatusPage icon="🗳️" title="No election running">
        <p className="mt-2 text-sm leading-6 text-slate-500">
          There is no active election at the moment. Check back later or view past
          results below.
        </p>
        <button
          onClick={() => router.push("/vote/results")}
          className="mt-7 w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          View past results →
        </button>
      </StatusPage>
    );
  }

  if (hasVoted) {
    return (
      <StatusPage icon="✅" title="Your vote has been recorded">
        <p className="mt-2 text-sm leading-6 text-slate-500">
          You have already cast your ballot for
        </p>
        <p className="mt-1 text-sm font-medium text-slate-800">{election?.title}</p>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs leading-5 text-slate-500">
          🔒 Your vote is anonymous and cannot be changed.
        </div>
        <button
          onClick={() => router.push("/vote/results")}
          className="mt-6 w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          View results →
        </button>
      </StatusPage>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar progressText={`${totalSelected} of ${totalPositions} selected`} />
      <div className="h-1 bg-slate-200">
        <div
          className="h-1 bg-indigo-500 transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl font-medium text-slate-800 sm:text-2xl">
            {election?.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select one candidate for each position. You cannot change your vote after
            submitting.
          </p>
        </div>

        <div className="space-y-5">
          {positions.map((position, index) => {
            const positionCandidates = candidates.filter(
              (candidate) => candidate.positionId === position._id,
            );
            const selected = selections[position._id];

            return (
              <section
                key={position._id}
                className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                  selected ? "border-2 border-indigo-500" : "border-slate-200"
                }`}
              >
                <header className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                        selected
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {selected ? "✓" : index + 1}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-medium text-slate-800">{position.title}</h2>
                      {position.description && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {position.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {!selected && (
                    <span className="self-start rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-600 sm:self-auto">
                      Select one
                    </span>
                  )}
                </header>

                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5">
                  {positionCandidates.map((candidate) => {
                    const isSelected = selected === candidate._id;
                    return (
                      <button
                        key={candidate._id}
                        type="button"
                        onClick={() => handleSelect(position._id, candidate._id)}
                        aria-pressed={isSelected}
                        className={`rounded-xl border p-4 text-center transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                          isSelected
                            ? "border-2 border-indigo-500 bg-indigo-50"
                            : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50"
                        }`}
                      >
                        <span
                          className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                            isSelected
                              ? "bg-indigo-500 text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {candidate.name.charAt(0)}
                        </span>
                        <span className="mt-2 block text-sm font-medium text-slate-800">
                          {candidate.name}
                        </span>
                        {candidate.studentId && (
                          <span className="mt-0.5 block text-xs text-slate-400">
                            {candidate.studentId}
                          </span>
                        )}
                        {candidate.manifesto && (
                          <span className="mt-2 block text-xs leading-5 text-slate-500">
                            “{candidate.manifesto}”
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:mt-8 sm:flex-row sm:items-center sm:justify-end">
          {!allSelected && (
            <p className="text-center text-xs text-slate-400 sm:mr-2 sm:text-right">
              {totalPositions - totalSelected} position
              {totalPositions - totalSelected !== 1 ? "s" : ""} remaining
            </p>
          )}
          <button
            onClick={handleReview}
            disabled={!allSelected}
            className={`w-full rounded-lg px-6 py-3 text-sm font-medium transition-colors sm:w-auto ${
              allSelected
                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            Review ballot →
          </button>
        </div>
      </main>
    </div>
  );
}
