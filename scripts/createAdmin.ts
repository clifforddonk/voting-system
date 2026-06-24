

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI!;

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  activated: Boolean,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);

  const existing = await User.findOne({ email: "admin@school.edu" });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const password = await bcrypt.hash("Admin1234!", 12);

  await User.create({
    name: "Admin",
    email: "admin@school.edu",
    password,
    role: "admin",
    activated: true,
  });

  console.log("✅ Admin created: admin@school.edu / Admin1234!");
  process.exit(0);
}

main().catch(console.error);
