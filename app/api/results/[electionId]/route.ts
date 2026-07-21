import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Election } from "@/models/Election";
import { Position } from "@/models/Position";
import { Candidate } from "@/models/Candidate";
import { Vote } from "@/models/Vote";
import { User } from "@/models/User";
import { auth } from "@/auth";
import { closeExpiredElections } from "@/lib/electionLifecycle";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ electionId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { electionId } = await params;
    await connectDB();
    await closeExpiredElections();

    const election = await Election.findById(electionId);
    if (!election) {
      return NextResponse.json({ error: "Election not found" }, { status: 404 });
    }

    // Voters can only see results of ended elections
    if (session.user.role !== "admin" && election.status !== "ended") {
      return NextResponse.json({ error: "Results not available yet" }, { status: 403 });
    }

    const [positions, candidates, totalVoters] = await Promise.all([
      Position.find({ electionId }).sort({ order: 1 }),
      Candidate.find({ electionId }),
      User.countDocuments({ role: "voter" }),
    ]);

    // Get vote counts per candidate
    const voteCounts = await Vote.aggregate([
      { $match: { electionId: election._id } },
      { $group: { _id: "$candidateId", count: { $sum: 1 } } },
    ]);

    const voteMap: Record<string, number> = {};
    voteCounts.forEach((v) => { voteMap[v._id.toString()] = v.count; });

    // Total unique voters who voted
    const totalVoted = await Vote.distinct("voterId", { electionId: election._id });

    // Build results per position
    const results = positions.map((position) => {
      const positionCandidates = candidates
        .filter((c) => c.positionId.toString() === position._id.toString())
        .map((c) => ({
          _id: c._id.toString(),
          name: c.name,
          studentId: c.studentId,
          votes: voteMap[c._id.toString()] || 0,
        }))
        .sort((a, b) => b.votes - a.votes);

      const totalVotesForPosition = positionCandidates.reduce((sum, c) => sum + c.votes, 0);
      const winner = positionCandidates[0] || null;

      return {
        position: { _id: position._id.toString(), title: position.title },
        candidates: positionCandidates.map((c) => ({
          ...c,
          percentage: totalVotesForPosition > 0
            ? Math.round((c.votes / totalVotesForPosition) * 100)
            : 0,
        })),
        winner,
        totalVotes: totalVotesForPosition,
      };
    });

    return NextResponse.json({
      election,
      results,
      stats: {
        totalVoters,
        totalVoted: totalVoted.length,
        turnout: totalVoters > 0
          ? Math.round((totalVoted.length / totalVoters) * 100)
          : 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
