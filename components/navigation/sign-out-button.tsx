"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutButton({ locale }: { locale: "ar" | "en" }) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() =>
        signOut({
          callbackUrl: `/${locale}`
        })
      }
    >
      {locale === "ar" ? "تسجيل الخروج" : "Sign out"}
    </Button>
  );
}
