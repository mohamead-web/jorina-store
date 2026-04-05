"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateOrderStatusAction } from "@/lib/actions/admin-actions";

const statusFlow = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED"
] as const;

const statusMeta: Record<string, { ar: string; en: string; color: string }> = {
  PENDING: { ar: "بانتظار المراجعة", en: "Pending", color: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  CONFIRMED: { ar: "تم التأكيد", en: "Confirmed", color: "border-sky-500/30 bg-sky-500/10 text-sky-300" },
  SHIPPED: { ar: "قيد الشحن", en: "Shipped", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  DELIVERED: { ar: "تم التسليم", en: "Delivered", color: "border-green-500/30 bg-green-500/10 text-green-300" },
  CANCELLED: { ar: "ملغي", en: "Cancelled", color: "border-red-500/30 bg-red-500/10 text-red-300" },
  RETURNED: { ar: "مُرتجع", en: "Returned", color: "border-violet-500/30 bg-violet-500/10 text-violet-300" }
};

type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";

export function AdminStatusUpdater({
  locale,
  orderNumber,
  currentStatus
}: {
  locale: "ar" | "en";
  orderNumber: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const ar = locale === "ar";
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const currentIndex = statusFlow.indexOf(currentStatus as typeof statusFlow[number]);
  const nextStatus = currentIndex >= 0 && currentIndex < statusFlow.length - 1
    ? statusFlow[currentIndex + 1]
    : null;

  const isFinal = currentStatus === "DELIVERED" || currentStatus === "CANCELLED" || currentStatus === "RETURNED";

  const handleUpdate = (newStatus: OrderStatus) => {
    setBusy(true);
    startTransition(async () => {
      const result = await updateOrderStatusAction({
        orderNumber,
        status: newStatus,
        note: note || undefined
      });

      if (result.success) {
        toast.success(ar ? "تم تحديث حالة الطلب" : "Order status updated");
        setNote("");
        router.refresh();
      } else {
        toast.error(ar ? "فشل التحديث" : "Update failed");
      }
      setBusy(false);
    });
  };

  const current = statusMeta[currentStatus];

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <h2 className="mb-4 text-xs uppercase tracking-[0.18em] text-white/30">
        {ar ? "تحديث الحالة" : "Update Status"}
      </h2>

      {/* Current status */}
      <div className={`mb-4 inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium ${current?.color}`}>
        {ar ? current?.ar : current?.en}
      </div>

      {/* Status progress */}
      <div className="mb-5 flex items-center gap-1">
        {statusFlow.map((status, index) => {
          const isActive = index <= currentIndex;
          return (
            <div
              key={status}
              className={`h-1.5 flex-1 rounded-full transition-all ${isActive ? "bg-rose-400" : "bg-white/10"}`}
            />
          );
        })}
      </div>

      {!isFinal ? (
        <>
          {/* Note input */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={ar ? "ملاحظة (اختياري)..." : "Note (optional)..."}
            className="mb-4 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:border-rose-500/30 focus:outline-none"
            rows={2}
          />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {nextStatus ? (
              <button
                onClick={() => handleUpdate(nextStatus)}
                disabled={busy}
                className="flex-1 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-rose-600 disabled:opacity-50"
              >
                {busy
                  ? (ar ? "جارٍ التحديث..." : "Updating...")
                  : ar
                    ? `تحويل إلى: ${statusMeta[nextStatus]?.ar}`
                    : `Move to: ${statusMeta[nextStatus]?.en}`}
              </button>
            ) : null}

            {currentStatus !== "CANCELLED" ? (
              <button
                onClick={() => handleUpdate("CANCELLED")}
                disabled={busy}
                className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-300 transition-all hover:bg-red-500/10 disabled:opacity-50"
              >
                {ar ? "إلغاء الطلب" : "Cancel"}
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <p className="text-sm text-white/30">
          {ar ? "هذا الطلب في حالته النهائية." : "This order is in its final state."}
        </p>
      )}
    </div>
  );
}
