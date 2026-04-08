"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CouponCopyButton({
  locale,
  code,
  variant = "secondary"
}: {
  locale: "ar" | "en";
  code: string;
  variant?: "primary" | "secondary" | "ghost" | "blush";
}) {
  return (
    <Button
      type="button"
      variant={variant}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          toast.success(locale === "ar" ? "تم نسخ الكوبون" : "Coupon copied");
        } catch (error) {
          console.error("Coupon copy error:", error);
          toast.error(locale === "ar" ? "تعذر نسخ الكوبون" : "Failed to copy coupon");
        }
      }}
    >
      <Copy className="h-4 w-4" />
      {locale === "ar" ? "نسخ" : "Copy"}
    </Button>
  );
}
