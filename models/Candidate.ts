import mongoose, { Schema, Document } from "mongoose";

export interface ICandidate extends Document {
  electionId: mongoose.Types.ObjectId;
  positionId: mongoose.Types.ObjectId;
  name: string;
  studentId?: string;
  photo?: string;
  manifesto?: string;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    electionId: { type: Schema.Types.ObjectId, ref: "Election", required: true },
    positionId: { type: Schema.Types.ObjectId, ref: "Position", required: true },
    name: { type: String, required: true },
    studentId: { type: String },
    photo: { type: String },
    manifesto: { type: String },
  },
  { timestamps: true }
);

export const Candidate = mongoose.models.Candidate || mongoose.model<ICandidate>("Candidate", CandidateSchema);