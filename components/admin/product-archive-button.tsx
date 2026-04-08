"use client";

import { Archive, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { archiveAdminProductAction } from "@/lib/actions/admin-product-actions";

export function ProductArchiveButton({
  locale,
  productId,
  disabled = false,
  redirectToList = false
}: {
  locale: "ar" | "en";
  productId: string;
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
            ? "سيتم إخفاء المنتج من المتجر العام. هل تريدين المتابعة؟"
            : "This will hide the product from the public storefront. Continue?"
        );

        if (!confirmed) {
          return;
        }

        startTransition(async () => {
          const result = await archiveAdminProductAction({ productId });

          if (!result.success) {
            toast.error(
              result.error ??
                (isArabic ? "تعذر أرشفة المنتج" : "Failed to archive product")
            );
            return;
          }

          toast.success(
            isArabic ? "تمت أرشفة المنتج" : "Product archived"
          );

          if (redirectToList) {
            router.replace(`/${locale}/admin/products`);
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
