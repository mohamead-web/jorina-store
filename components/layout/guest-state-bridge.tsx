"use client";

import { startTransition, useEffect, useEffectEvent, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { mergeGuestStateAction } from "@/lib/actions/cart-actions";

function hasGuestCartCookie() {
  return document.cookie.includes("jorina_cart_token=");
}

export function GuestStateBridge({ locale }: { locale: "ar" | "en" }) {
  const { status } = useSession();
  const router = useRouter();
  const hasMergedRef = useRef(false);

  const handleMerge = useEffectEvent(async () => {
    await mergeGuestStateAction(locale);
    router.refresh();
  });

  useEffect(() => {
    if (status !== "authenticated" || hasMergedRef.current || !hasGuestCartCookie()) {
      return;
    }

    hasMergedRef.current = true;
    startTransition(() => {
      void handleMerge();
    });
  }, [status]);

  return null;
}
