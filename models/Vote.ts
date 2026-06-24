import mongoose, { Schema, Document } from "mongoose";

export interface IVote extends Document {
  electionId: mongoose.Types.ObjectId;
  positionId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  voterId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    electionId: { type: Schema.Types.ObjectId, ref: "Election", required: true },
    positionId: { type: Schema.Types.ObjectId, ref: "Position", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
    voterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// This is your cheat code against double voting — enforced at the DB level
VoteSchema.index({ voterId: 1, electionId: 1, positionId: 1 }, { unique: true });

export const Vote = mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema);