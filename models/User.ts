import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  studentId?: string;
  password?: string;
  role: "admin" | "voter";
  activated: boolean;
  level?: "100" | "200" | "300" | "400";
  inviteStatus: "pending" | "invited" | "activated";
  inviteToken?: string;
  inviteTokenExpiry?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    studentId: { type: String, sparse: true },
    password: { type: String },
    role: { type: String, enum: ["admin", "voter"], default: "voter" },
    activated: { type: Boolean, default: false },
    level: { type: String, enum: ["100", "200", "300", "400"] },
    inviteStatus: {
      type: String,
      enum: ["pending", "invited", "activated"],
      default: "pending",
    },
    inviteToken: { type: String },
    inviteTokenExpiry: { type: Date },
  },
  { timestamps: true },
);

delete mongoose.models.User;
export const User = mongoose.model<IUser>("User", UserSchema);
