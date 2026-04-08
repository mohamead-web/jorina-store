"use client";

import { useEffect, useState } from "react";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import {
  CouponPanel,
  type AppliedCouponState
} from "@/components/checkout/coupon-panel";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Button } from "@/components/ui/button";
import {
  getDefaultShippingCity,
  getShippingFeeForLocation,
  type ShippingCityCode
} from "@/lib/constants/commerce";
import type { CheckoutFormValues } from "@/lib/validators/checkout";
import type { AppCountry, AppCurrency } from "@/types/domain";

export function CheckoutWizard({
  locale,
  subtotal,
  defaults,
  countryCode,
  currencyCode
}: {
  locale: "ar" | "en";
  subtotal: number;
  defaults?: Partial<CheckoutFormValues>;
  countryCode: AppCountry;
  currencyCode: AppCurrency;
}) {
  const [shippingFee, setShippingFee] = useState<number>(() =>
    getShippingFeeForLocation(
      countryCode,
      defaults?.city ?? getDefaultShippingCity(countryCode)
    )
  );
  const [checkoutEmail, setCheckoutEmail] = useState(defaults?.email ?? "");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!appliedCoupon) {
      return;
    }

    const normalizedEmail = checkoutEmail.trim().toLowerCase();

    if (normalizedEmail !== appliedCoupon.email) {
      setAppliedCoupon(null);
    }
  }, [appliedCoupon, checkoutEmail]);

  const handleCityChange = (cityCode: ShippingCityCode) => {
    setShippingFee(getShippingFeeForLocation(countryCode, cityCode));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <CheckoutForm
        locale={locale}
        defaults={defaults}
        formId="checkout-form"
        showSubmit={false}
        onCityChange={handleCityChange}
        onSubmittingChange={setIsSubmitting}
        onEmailChange={setCheckoutEmail}
        couponCode={appliedCoupon?.code ?? ""}
      />
      <div className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
        <OrderSummary
          locale={locale}
          subtotal={subtotal}
          shippingFee={shippingFee}
          discountAmount={appliedCoupon?.discountAmount ?? 0}
          couponCode={appliedCoupon?.code}
          currency={currencyCode}
        >
          <CouponPanel
            locale={locale}
            subtotal={subtotal}
            currency={currencyCode}
            email={checkoutEmail}
            appliedCoupon={appliedCoupon}
            disabled={isSubmitting}
            onApply={setAppliedCoupon}
            onRemove={() => setAppliedCoupon(null)}
          />
        </OrderSummary>
        <Button
          form="checkout-form"
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? locale === "ar"
              ? "جارٍ التأكيد..."
              : "Confirming..."
            : locale === "ar"
              ? "تأكيد الطلب"
              : "Confirm order"}
        </Button>
      </div>
    </div>
  );
}
