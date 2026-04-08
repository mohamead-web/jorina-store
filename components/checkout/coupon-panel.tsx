"use client";

import { Loader2, Tag, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { previewCouponAction } from "@/lib/actions/checkout-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { AppCurrency } from "@/types/domain";

export type AppliedCouponState = {
  code: string;
  discountAmount: number;
  email: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function CouponPanel({
  locale,
  subtotal,
  currency,
  email,
  appliedCoupon,
  disabled = false,
  onApply,
  onRemove
}: {
  locale: "ar" | "en";
  subtotal: number;
  currency: AppCurrency;
  email: string;
  appliedCoupon: AppliedCouponState | null;
  disabled?: boolean;
  onApply: (coupon: AppliedCouponState) => void;
  onRemove: () => void;
}) {
  const [code, setCode] = useState(appliedCoupon?.code ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCode(appliedCoupon?.code ?? "");
  }, [appliedCoupon?.code]);

  return (
    <div className="rounded-[1.2rem] border border-border bg-background-soft/70 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-text">
        <Tag className="h-4 w-4 text-blush" />
        <span>{locale === "ar" ? "كوبون الخصم" : "Discount coupon"}</span>
      </div>
      <p className="mt-2 text-xs leading-6 text-text-soft">
        {locale === "ar"
          ? "أدخلي الكود هنا. إذا كان الكوبون مخصصًا فسيتم مطابقته مع الإيميل المكتوب في الطلب."
          : "Enter your code here. Targeted coupons are matched against the email entered in checkout."}
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder={locale === "ar" ? "مثال: JORINA-25OFF" : "Example: JORINA-25OFF"}
          className="h-11"
          disabled={disabled || isPending}
        />
        <Button
          type="button"
          size="sm"
          disabled={disabled || isPending}
          onClick={() => {
            const normalizedCode = code.trim().toUpperCase();
            const normalizedEmail = normalizeEmail(email);

            if (!normalizedCode) {
              toast.error(locale === "ar" ? "أدخلي كود الكوبون أولًا" : "Enter a coupon code first");
              return;
            }

            if (!normalizedEmail) {
              toast.error(
                locale === "ar"
                  ? "أدخلي البريد الإلكتروني في نموذج الطلب قبل تطبيق الكوبون"
                  : "Enter your email in the checkout form before applying the coupon"
              );
              return;
            }

            startTransition(async () => {
              const result = await previewCouponAction({
                code: normalizedCode,
                email: normalizedEmail,
                subtotal
              });

              if (!result.success || !result.coupon) {
                toast.error(
                  result.error ??
                    (locale === "ar"
                      ? "تعذر تطبيق الكوبون"
                      : "Failed to apply the coupon")
                );
                return;
              }

              onApply({
                code: result.coupon.couponCode,
                discountAmount: result.coupon.discountAmount,
                email: normalizedEmail
              });
              toast.success(
                locale === "ar"
                  ? "تم تطبيق الكوبون على الطلب"
                  : "Coupon applied to the order"
              );
            });
          }}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : locale === "ar" ? (
            "تطبيق"
          ) : (
            "Apply"
          )}
        </Button>
      </div>

      {appliedCoupon ? (
        <div className="mt-3 rounded-[1rem] border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-950">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">
                {locale === "ar" ? "تم تطبيق الكود" : "Applied code"}: {appliedCoupon.code}
              </p>
              <p className="mt-1 text-xs text-emerald-900/80">
                {locale === "ar" ? "الخصم الحالي" : "Current discount"}:{" "}
                {formatCurrency(appliedCoupon.discountAmount, locale, currency)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCode("");
                onRemove();
              }}
              className="rounded-full p-1 text-emerald-950/70 transition hover:bg-emerald-500/10 hover:text-emerald-950"
              aria-label={locale === "ar" ? "إزالة الكوبون" : "Remove coupon"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
