import { cn, formatCurrency } from "@/lib/utils";
import type { AppCurrency } from "@/types/domain";

export function OrderSummary({
  locale,
  subtotal,
  shippingFee,
  currency,
  className
}: {
  locale: "ar" | "en";
  subtotal: number;
  shippingFee: number;
  currency: AppCurrency;
  className?: string;
}) {
  const total = subtotal + shippingFee;

  return (
    <div className={cn("premium-card px-5 py-5", className)}>
      <h3 className="font-display text-3xl text-text">
        {locale === "ar" ? "ملخص الطلب" : "Order summary"}
      </h3>
      <div className="mt-5 space-y-4 text-sm text-text-soft">
        <div className="flex items-center justify-between">
          <span>{locale === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
          <span className="text-text">{formatCurrency(subtotal, locale, currency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{locale === "ar" ? "رسوم الشحن" : "Shipping fee"}</span>
          <span className="text-text">{formatCurrency(shippingFee, locale, currency)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold text-text">
          <span>{locale === "ar" ? "الإجمالي" : "Total"}</span>
          <span>{formatCurrency(total, locale, currency)}</span>
        </div>
      </div>
    </div>
  );
}
