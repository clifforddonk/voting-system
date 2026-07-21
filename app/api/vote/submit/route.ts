import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Election } from "@/models/Election";
import { Position } from "@/models/Position";
import { Candidate } from "@/models/Candidate";
import { Vote } from "@/models/Vote";
import { auth } from "@/auth";
import { closeExpiredElections } from "@/lib/electionLifecycle";
import { z } from "zod";

const submitSchema = z.object({
  electionId: z.string(),
  votes: z.array(z.object({
    positionId: z.string(),
    candidateId: z.string(),
  })),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid ballot data" }, { status: 400 });
    }

    const { electionId, votes } = parsed.data;

    await connectDB();
    await closeExpiredElections();

    // Verify election is active and still inside its voting window.
    const now = new Date();
    const election = await Election.findOne({
      _id: electionId,
      status: "active",
      startDate: { $lte: now },
      endDate: { $gt: now },
    });
    if (!election) {
      return NextResponse.json({ error: "This election is not currently open for voting" }, { status: 400 });
    }

    // Verify voter hasn't already voted
    const existingVote = await Vote.findOne({
      voterId: session.user.id,
      electionId,
    });
    if (existingVote) {
      return NextResponse.json({ error: "You have already voted" }, { status: 400 });
    }

    // Verify all positions are covered
    const positions = await Position.find({ electionId });
    if (votes.length !== positions.length) {
      return NextResponse.json({ error: "You must vote for all positions" }, { status: 400 });
    }

    // Verify all candidates belong to the correct positions
    for (const vote of votes) {
      const candidate = await Candidate.findOne({
        _id: vote.candidateId,
        positionId: vote.positionId,
        electionId,
      });
      if (!candidate) {
        return NextResponse.json({ error: "Invalid candidate selection" }, { status: 400 });
      }
    }

    // Save all votes
    await Vote.insertMany(
      votes.map((vote) => ({
        electionId,
        positionId: vote.positionId,
        candidateId: vote.candidateId,
        voterId: session.user.id,
      }))
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Handle duplicate vote attempt at DB level
    if (err.code === 11000) {
      return NextResponse.json({ error: "You have already voted" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit ballot" }, { status: 500 });
  }
}
