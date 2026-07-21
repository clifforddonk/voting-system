import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Election } from "@/models/Election";
import { auth } from "@/auth";
import { z } from "zod";
import { closeExpiredElections } from "@/lib/electionLifecycle";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["draft", "active", "ended"]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await closeExpiredElections();
    const election = await Election.findById(id);
    if (!election) return NextResponse.json({ error: "Election not found" }, { status: 404 });
    return NextResponse.json({ election });
  } catch {
    return NextResponse.json({ error: "Failed to fetch election" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    await connectDB();
    await closeExpiredElections();

    const currentElection = await Election.findById(id);
    if (!currentElection) {
      return NextResponse.json({ error: "Election not found" }, { status: 404 });
    }

    const isEndingActiveElection =
      currentElection.status === "active" &&
      parsed.data.status === "ended" &&
      Object.keys(parsed.data).length === 1;

    const extendedEndDate = parsed.data.endDate ? new Date(parsed.data.endDate) : null;
    const isExtensionRequest =
      currentElection.status === "active" &&
      extendedEndDate !== null &&
      Object.keys(parsed.data).length === 1;
    const isExtendingActiveElection =
      isExtensionRequest &&
      extendedEndDate !== null &&
      extendedEndDate > new Date() &&
      extendedEndDate > currentElection.endDate;

    if (isExtensionRequest && !isExtendingActiveElection) {
      return NextResponse.json(
        { error: "The new end time must be later than both now and the current deadline" },
        { status: 400 },
      );
    }

    if (currentElection.status !== "draft" && !isEndingActiveElection && !isExtendingActiveElection) {
      return NextResponse.json(
        { error: "An election cannot be changed after it has started" },
        { status: 409 },
      );
    }

    // If activating this election, end all others first
    if (parsed.data.status === "active") {
      await Election.updateMany(
        { _id: { $ne: id }, status: "active" },
        { status: "ended" },
      );
    }

    const election = await Election.findByIdAndUpdate(
      id,
      {
        ...parsed.data,
        ...(parsed.data.startDate && {
          startDate: new Date(parsed.data.startDate),
        }),
        ...(parsed.data.endDate && { endDate: new Date(parsed.data.endDate) }),
      },
      { new: true },
    );

    if (!election) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ election });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await closeExpiredElections();
    const election = await Election.findOneAndDelete({ _id: id, status: "draft" });
    if (!election) {
      return NextResponse.json(
        { error: "Only draft elections can be deleted" },
        { status: 409 },
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
