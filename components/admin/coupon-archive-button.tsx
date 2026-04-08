"use client";

import { Archive, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { archiveAdminCouponAction } from "@/lib/actions/admin-coupon-actions";

export function CouponArchiveButton({
  locale,
  couponId,
  disabled = false,
  redirectToList = false
}: {
  locale: "ar" | "en";
  couponId: string;
  disabled?: boolean;
  redirectToList?: boolean;
}) {
  const router = useRouter();
  const isArabic = locale === "ar";
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={disabled || isPending}
      onClick={() => {
        const confirmed = window.confirm(
          isArabic
            ? "سيتم تعطيل هذا الكوبون ومنع استخدامه في الطلبات الجديدة. هل تريد المتابعة؟"
            : "This will disable the coupon for future orders. Continue?"
        );

        if (!confirmed) {
          return;
        }

        startTransition(async () => {
          const result = await archiveAdminCouponAction({ couponId });

          if (!result.success) {
            toast.error(
              result.error ??
                (isArabic ? "تعذر أرشفة الكوبون" : "Failed to archive coupon")
            );
            return;
          }

          toast.success(isArabic ? "تمت أرشفة الكوبون" : "Coupon archived");

          if (redirectToList) {
            router.replace(`/${locale}/admin/coupons`);
          }

          router.refresh();
        });
      }}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Archive className="h-4 w-4" />
      )}
      {isArabic ? "أرشفة" : "Archive"}
    </Button>
  );
}
