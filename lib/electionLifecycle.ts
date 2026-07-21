import { Election } from "@/models/Election";

/** Ends any active election whose deadline has passed. Call after connecting to MongoDB. */
export async function closeExpiredElections() {
  await Election.updateMany(
    { status: "active", endDate: { $lte: new Date() } },
    { $set: { status: "ended" } },
  );
}
