import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { Election } from "@/models/Election";
import { auth } from "@/auth";
import { z } from "zod";

const candidateSchema = z.object({
  name: z.string().min(1),
  positionId: z.string().min(1),
  studentId: z.string().optional(),
  manifesto: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const candidates = await Candidate.find({ electionId: id });
    return NextResponse.json({ candidates });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = candidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const election = await Election.findOne({ _id: id, status: "draft" });
    if (!election) {
      return NextResponse.json({ error: "Election setup is locked once voting has started" }, { status: 409 });
    }
    const candidate = await Candidate.create({ ...parsed.data, electionId: id });
    return NextResponse.json({ candidate }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
