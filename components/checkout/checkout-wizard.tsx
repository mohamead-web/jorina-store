"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      />
      <div className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
        <OrderSummary
          locale={locale}
          subtotal={subtotal}
          shippingFee={shippingFee}
          currency={currencyCode}
        />
        <Button form="checkout-form" type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (locale === "ar" ? "جاري التأكيد..." : "Confirming...") : (locale === "ar" ? "تأكيد الطلب" : "Confirm order")}
        </Button>
      </div>
    </div>
  );
}
