import mongoose, { Schema, Document } from "mongoose";

export interface IPosition extends Document {
  electionId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
}

const PositionSchema = new Schema<IPosition>(
  {
    electionId: { type: Schema.Types.ObjectId, ref: "Election", required: true },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Position = mongoose.models.Position || mongoose.model<IPosition>("Position", PositionSchema);