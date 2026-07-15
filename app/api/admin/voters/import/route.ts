import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { auth } from "@/auth";
import { z } from "zod";

const voterRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  studentId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rows: unknown[] = body.voters;
    const allowedLevels = ["100", "200", "300", "400"] as const;
    type Level = (typeof allowedLevels)[number];
    const level = body.level as string;

    if (!allowedLevels.includes(level as Level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No voter data provided" }, { status: 400 });
    }

    await connectDB();

    const results = { imported: 0, skipped: 0, failed: 0, errors: [] as string[] };

    for (const row of rows) {
      const parsed = voterRowSchema.safeParse(row);

      if (!parsed.success) {
        results.failed++;
        results.errors.push(`Invalid row — ${parsed.error.issues[0].message}`);
        continue;
      }

      const { name, email, studentId } = parsed.data;

      const existing = await User.findOne({ email });
      if (existing) {
        results.skipped++;
        continue;
      }

      await User.create({
        name,
        email,
        studentId,
        role: "voter",
        level: level as Level,
        activated: false,
        inviteStatus: "pending",
      });

      results.imported++;
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}