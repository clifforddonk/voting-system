import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { generateInviteToken } from "@/lib/tokens";
import { sendInviteEmail } from "@/lib/email";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { level } = body; // optional — if provided, only send to that level

    await connectDB();

    const filter: Record<string, string> = {
      role: "voter",
      inviteStatus: "pending",
    };

    if (level && ["100", "200", "300", "400"].includes(level)) {
      filter.level = level;
    }

    const voters = await User.find(filter);

    if (voters.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "No pending voters found" });
    }

    let sent = 0;
    const errors: string[] = [];

    for (const voter of voters) {
      try {
        const token = await generateInviteToken(voter._id.toString());
        await sendInviteEmail({ name: voter.name, email: voter.email, token });
        await User.findByIdAndUpdate(voter._id, { inviteStatus: "invited" });
        sent++;
      } catch {
        errors.push(`Failed to send to ${voter.email}`);
      }
    }

    return NextResponse.json({ success: true, sent, errors });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send invites" }, { status: 500 });
  }
}