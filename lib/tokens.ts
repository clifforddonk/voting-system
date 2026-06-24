import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function generateInviteToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await connectDB();
  await User.findByIdAndUpdate(userId, {
    inviteToken: token,
    inviteTokenExpiry: expiry,
  });

  return token;
}

export async function verifyInviteToken(token: string) {
  await connectDB();

  const user = await User.findOne({
    inviteToken: token,
    inviteTokenExpiry: { $gt: new Date() },
  });

  return user; // null if not found or expired
}