import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Election } from "@/models/Election";
import { Position } from "@/models/Position";
import { Candidate } from "@/models/Candidate";
import { Vote } from "@/models/Vote";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const election = await Election.findOne({ status: "active" });
    if (!election) {
      return NextResponse.json({ error: "No active election" }, { status: 404 });
    }

    const [positions, candidates] = await Promise.all([
      Position.find({ electionId: election._id }).sort({ order: 1 }),
      Candidate.find({ electionId: election._id }),
    ]);

    // Check if voter already voted
    const existingVote = await Vote.findOne({
      voterId: session.user.id,
      electionId: election._id,
    });

    return NextResponse.json({
      election,
      positions,
      candidates,
      hasVoted: !!existingVote,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}