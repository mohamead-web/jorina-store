import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

const statusVariants: Record<string, string> = {
  PENDING: "bg-[#f6efe8] text-[#8b5b31]",
  CONFIRMED: "bg-[#eef2f7] text-[#37506f]",
  SHIPPED: "bg-[#eef5f2] text-[#36684b]",
  DELIVERED: "bg-[#eaf5ee] text-[#24623f]",
  CANCELLED: "bg-[#f8ecec] text-[#924545]",
  RETURNED: "bg-[#f2eef8] text-[#6b4f8d]",
  REQUESTED: "bg-[#f5f0ea] text-[#7b6047]",
  UNDER_REVIEW: "bg-[#eef0f7] text-[#506087]",
  APPROVED: "bg-[#edf6ef] text-[#3d6c48]",
  REJECTED: "bg-[#f8ecec] text-[#924545]",
  RECEIVED: "bg-[#eef5f2] text-[#36684b]",
  REFUNDED: "bg-[#f1eef8] text-[#6d5790]"
};

export function StatusPill({ status }: { status: string }) {
  const t = useTranslations(
    status in {
      PENDING: true,
      CONFIRMED: true,
      SHIPPED: true,
      DELIVERED: true,
      CANCELLED: true,
      RETURNED: true
    }
      ? "orderStatus"
      : "returnStatus"
  );

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        statusVariants[status] ?? "bg-background-soft text-text-soft"
      )}
    >
      {t(status)}
    </span>
  );
}
