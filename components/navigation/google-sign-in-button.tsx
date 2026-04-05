"use client";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function GoogleSignInButton({
  locale,
  callbackUrl
}: {
  locale: "ar" | "en";
  callbackUrl?: string;
}) {
  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      onClick={() =>
        signIn("google", {
          callbackUrl
        })
      }
    >
      {locale === "ar" ? "المتابعة عبر Google" : "Continue with Google"}
    </Button>
  );
}
