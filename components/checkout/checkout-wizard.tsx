"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import type { CheckoutFormValues } from "@/lib/validators/checkout";

type Governorate = "cairo" | "giza" | "alexandria" | "other";

const shippingRates: Record<Governorate, number> = {
  cairo: 50,
  giza: 50,
  alexandria: 60,
  other: 80
};

export function CheckoutWizard({
  locale,
  subtotal,
  defaults
}: {
  locale: "ar" | "en";
  subtotal: number;
  defaults?: Partial<CheckoutFormValues>;
}) {
  const [shippingFee, setShippingFee] = useState<number>(shippingRates.cairo);

  const handleCityChange = (cityCode: Governorate) => {
    setShippingFee(shippingRates[cityCode]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <CheckoutForm
        locale={locale}
        defaults={defaults}
        formId="checkout-form"
        showSubmit={false}
        onCityChange={handleCityChange}
      />
      <div className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
        <OrderSummary locale={locale} subtotal={subtotal} shippingFee={shippingFee} />
        <Button form="checkout-form" type="submit" size="lg" className="w-full">
          {locale === "ar" ? "تأكيد الطلب" : "Confirm order"}
        </Button>
      </div>
    </div>
  );
}
