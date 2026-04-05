import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";

export async function getServerAuthSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getServerAuthSession();

  return session?.user ?? null;
}
