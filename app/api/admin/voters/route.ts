import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");
    const search = searchParams.get("search");

    await connectDB();

    const filter: Record<string, unknown> = { role: "voter" };
    if (level && level !== "all") filter.level = level;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
      ];
    }

    const [voters, stats] = await Promise.all([
      User.find(filter).select("-password -inviteToken -inviteTokenExpiry").sort({ createdAt: -1 }),
      User.aggregate([
        { $match: { role: "voter" } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ["$inviteStatus", "pending"] }, 1, 0] } },
            invited: { $sum: { $cond: [{ $eq: ["$inviteStatus", "invited"] }, 1, 0] } },
            activated: { $sum: { $cond: [{ $eq: ["$inviteStatus", "activated"] }, 1, 0] } },
            voted: { $sum: { $cond: [{ $eq: ["$inviteStatus", "voted"] }, 1, 0] } },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      voters,
      stats: stats[0] || { total: 0, pending: 0, invited: 0, activated: 0, voted: 0 },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch voters" }, { status: 500 });
  }
}