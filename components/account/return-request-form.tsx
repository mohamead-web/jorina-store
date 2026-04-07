"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { requestReturnAction } from "@/lib/actions/account-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReturnRequestForm({
  locale,
  orderId,
  orderItemId
}: {
  locale: "ar" | "en";
  orderId: string;
  orderItemId: string;
}) {
  const router = useRouter();

  return (
    <form
      className="rounded-[1.3rem] border border-border bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          try {
            await requestReturnAction(locale, {
              orderId,
              orderItemId,
              reason: String(formData.get("reason") ?? ""),
              notes: String(formData.get("notes") ?? "")
            });
            router.refresh();
            toast.success(
              locale === "ar" ? "تم إرسال طلب الإرجاع" : "Return request submitted"
            );
            event.currentTarget.reset();
          } catch (error) {
            toast.error(locale === "ar" ? "تعذر إرسال طلب الإرجاع" : "Failed to submit return request");
          }
        });
      }}
    >
      <Textarea
        name="reason"
        required
        placeholder={
          locale === "ar"
            ? "سبب الإرجاع"
            : "Tell us why you would like to return this item"
        }
      />
      <Textarea
        name="notes"
        className="mt-3"
        placeholder={locale === "ar" ? "ملاحظات إضافية" : "Additional notes"}
      />
      <Button type="submit" variant="secondary" className="mt-3">
        {locale === "ar" ? "طلب إرجاع" : "Request return"}
      </Button>
    </form>
  );
}
