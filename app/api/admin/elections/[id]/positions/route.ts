import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Position } from "@/models/Position";
import { Election } from "@/models/Election";
import { auth } from "@/auth";
import { z } from "zod";

const positionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }>}) {
    const { id } = await params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const positions = await Position.find({ electionId: id }).sort({ order: 1 });
    return NextResponse.json({ positions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }:{ params: Promise<{ id: string }>}) {
    const { id } = await params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = positionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const election = await Election.findOne({ _id: id, status: "draft" });
    if (!election) {
      return NextResponse.json({ error: "Election setup is locked once voting has started" }, { status: 409 });
    }
    const position = await Position.create({ ...parsed.data, electionId: id });
    return NextResponse.json({ position }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
