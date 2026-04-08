import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/lib/db/prisma";

const hasGoogleProvider =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

type AuthRole = "CUSTOMER" | "ADMIN";

async function promoteAdminUser(user: {
  id: string;
  email?: string | null;
  role?: AuthRole | null;
}) {
  const normalizedEmail = user.email?.toLowerCase();

  if (!normalizedEmail || !adminEmails.includes(normalizedEmail)) {
    return user.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
  }

  if (user.role !== "ADMIN") {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" }
    });
  }

  return "ADMIN";
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database"
  },
  providers: hasGoogleProvider
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          allowDangerousEmailAccountLinking: true
        })
      ]
    : [],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const dbUser = user as typeof user & {
          email?: string | null;
          role?: AuthRole | null;
        };
        const resolvedRole = await promoteAdminUser({
          id: user.id,
          email: dbUser.email,
          role: dbUser.role
        });

        session.user.id = user.id;
        session.user.role = resolvedRole;
      }

      return session;
    }
  },
  events: {
    async createUser({ user }) {
      await promoteAdminUser(user);
    }
  }
};

export const isGoogleAuthConfigured = hasGoogleProvider;
