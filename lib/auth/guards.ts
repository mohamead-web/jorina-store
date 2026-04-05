import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

export async function requireUser(locale: "ar" | "en", callbackPath = "/account") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}${callbackPath}`);
  }

  return user;
}

export async function requireAdmin(locale: "ar" | "en") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/admin`);
  }

  if (user.role !== "ADMIN") {
    redirect(`/${locale}`);
  }

  return user;
}
