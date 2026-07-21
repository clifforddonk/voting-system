import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { Election } from "@/models/Election";
import { auth } from "@/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; candidateId: string }> }) {
    const { id, candidateId } = await params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const election = await Election.findOne({ _id: id, status: "draft" });
    if (!election) {
      return NextResponse.json({ error: "Election setup is locked once voting has started" }, { status: 409 });
    }
    await Candidate.findOneAndDelete({ _id: candidateId, electionId: id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
