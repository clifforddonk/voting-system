import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Election } from "@/models/Election";
import { auth } from "@/auth";
import { closeExpiredElections } from "@/lib/electionLifecycle";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await closeExpiredElections();

    const elections = await Election.find({ status: "ended" }).sort({ endDate: -1 });

    return NextResponse.json({ elections });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
