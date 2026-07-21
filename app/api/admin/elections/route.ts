import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Election } from "@/models/Election";
import { closeExpiredElections } from "@/lib/electionLifecycle";
import { auth } from "@/auth";
import { z } from "zod";

const electionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
}).refine(
  ({ startDate, endDate }) => new Date(endDate) > new Date(startDate),
  { message: "End date must be after the start date", path: ["endDate"] },
);

// GET — list all elections
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    await closeExpiredElections();
    const elections = await Election.find().sort({ createdAt: -1 });
    return NextResponse.json({ elections });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST — create election
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = electionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const election = await Election.create({
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      createdBy: session.user.id,
      status: "draft",
    });

    return NextResponse.json({ election }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
