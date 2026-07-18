import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { z } from "zod";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);
if (!NEXTAUTH_URL) {
  throw new Error("NEXTAUTH_URL or AUTH_URL is required in production. Set it in Vercel environment variables to your deployed app URL.");
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? (process.env.NODE_ENV === "development" ? "dev-secret" : undefined),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("1. authorize called", credentials);

        const parsed = loginSchema.safeParse(credentials);
        console.log("2. parsed", parsed.success);
        if (!parsed.success) return null;

        await connectDB();

        const user = await User.findOne({ email: parsed.data.email });
        console.log(
          "3. user found",
          user?.email,
          "activated:",
          user?.activated,
        );

        if (!user) return null;
        if (!user.activated) return null;
        if (!user.password) return null;

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.password,
        );
        console.log("4. password match", passwordMatch);

        if (!passwordMatch) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
