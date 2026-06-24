import mongoose, { Schema, Document } from "mongoose";

export interface IElection extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: "draft" | "active" | "ended";
  createdBy: mongoose.Types.ObjectId;
}

const ElectionSchema = new Schema<IElection>(
  {
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["draft", "active", "ended"], default: "draft" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Election = mongoose.models.Election || mongoose.model<IElection>("Election", ElectionSchema);