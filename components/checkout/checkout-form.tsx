"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { startTransition, useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { placeOrderAction } from "@/lib/actions/checkout-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type ShippingCityCode } from "@/lib/constants/commerce";
import {
  checkoutSchema,
  type CheckoutFormValues
} from "@/lib/validators/checkout";
import { LocationPicker } from "@/components/ui/location-picker";

export function CheckoutForm({
  locale,
  defaults,
  formId = "checkout-form",
  showSubmit = true,
  onCityChange,
  onSubmittingChange
}: {
  locale: "ar" | "en";
  defaults?: Partial<CheckoutFormValues>;
  formId?: string;
  showSubmit?: boolean;
  onCityChange?: (cityCode: ShippingCityCode) => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}) {
  const router = useRouter();
  const initialCallingCode = defaults?.countryCode === "SD" ? "+249" : "+20";
  const [callingCode, setCallingCode] = useState(initialCallingCode);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (onSubmittingChange) {
      onSubmittingChange(isPending);
    }
  }, [isPending, onSubmittingChange]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: defaults?.email ?? "",
      fullName: defaults?.fullName ?? "",
      phoneNumber: defaults?.phoneNumber ?? "",
      countryCode: defaults?.countryCode ?? "EG",
      city: defaults?.city ?? (defaults?.countryCode === "SD" ? "khartoum" : "cairo"),
      area: defaults?.area ?? "",
      detailedAddress: defaults?.detailedAddress ?? "",
      notes: defaults?.notes ?? "",
      localeCode: locale,
      latitude: defaults?.latitude ?? undefined,
      longitude: defaults?.longitude ?? undefined
    }
  });

  return (
    <form
      id={formId}
      className="premium-card space-y-5 p-5 sm:p-6"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const cleanPhone = values.phoneNumber.replace(/^0+/, "");
          const finalValues = { ...values, phoneNumber: `${callingCode}${cleanPhone}` };
          const result = await placeOrderAction(finalValues);
          if (result.success && result.orderNumber) {
            router.push(`/${locale}/checkout/success?order=${result.orderNumber}`);
            router.refresh();
            toast.success(locale === "ar" ? "تم تأكيد استلام الطلب" : "Order received");
          } else {
            toast.error(locale === "ar" ? "حدث خطأ أثناء تأكيد الطلب، حاول مرة أخرى" : "Checkout failed. Please try again.");
          }
        });
      })}
    >
      <h2 className="font-display text-3xl text-text">
        {locale === "ar" ? "معلومات التواصل والشحن (الدفع عند الاستلام)" : "Contact & shipping (COD)"}
      </h2>
      <p className="text-sm leading-7 text-text-soft">
        {locale === "ar"
          ? "الرجاء إدخال بيانات التوصيل بدقة لضمان وصول طلبك في أسرع وقت. الدفع سيكون نقداً عند الاستلام."
          : "Please enter your delivery details accurately. Payment will be collected in cash upon delivery."}
      </p>
      <Input
        type="email"
        autoComplete="email"
        placeholder={locale === "ar" ? "البريد الإلكتروني" : "Email address"}
        {...form.register("email")}
      />
      <Input
        autoComplete="name"
        placeholder={locale === "ar" ? "الاسم الكامل" : "Full name"}
        {...form.register("fullName")}
      />
      <div className="flex gap-2">
        <select
          className="flex h-11 w-max min-w-[120px] rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/20"
          value={callingCode}
          onChange={(e) => setCallingCode(e.target.value)}
          dir="ltr"
        >
          <option value="+20">🇪🇬 +20 (مصر)</option>
          <option value="+249">🇸🇩 +249 (السودان)</option>
        </select>
        <Input
          className="flex-1 text-left"
          dir="ltr"
          type="tel"
          autoComplete="tel"
          placeholder={locale === "ar" ? "رقم الهاتف (بدون صفر)" : "Phone number (no zero)"}
          {...form.register("phoneNumber")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {defaults?.countryCode === "SD" ? (
          <select
            className="flex h-11 w-full rounded-md border border-black/10 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/20"
            {...form.register("city")}
            onChange={(e) => {
              form.setValue("city", e.target.value);
              onCityChange?.(e.target.value as ShippingCityCode);
            }}
          >
            <option value="khartoum">{locale === "ar" ? "الخرطوم" : "Khartoum"}</option>
            <option value="omdurman">{locale === "ar" ? "أم درمان" : "Omdurman"}</option>
            <option value="bahri">{locale === "ar" ? "بحري" : "Bahri"}</option>
            <option value="other">{locale === "ar" ? "أخرى" : "Other"}</option>
          </select>
        ) : (
          <select
            className="flex h-11 w-full rounded-md border border-black/10 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/20"
            {...form.register("city")}
            onChange={(e) => {
              form.setValue("city", e.target.value);
              onCityChange?.(e.target.value as ShippingCityCode);
            }}
          >
            <option value="cairo">{locale === "ar" ? "القاهرة" : "Cairo"}</option>
            <option value="giza">{locale === "ar" ? "الجيزة" : "Giza"}</option>
            <option value="alexandria">{locale === "ar" ? "الإسكندرية" : "Alexandria"}</option>
            <option value="other">{locale === "ar" ? "محافظة أخرى" : "Other Governorate"}</option>
          </select>
        )}
        <Input
          autoComplete="address-level3"
          placeholder={locale === "ar" ? "الحي / المنطقة" : "Area / district"}
          {...form.register("area")}
        />
      </div>
      <Textarea
        autoComplete="street-address"
        placeholder={locale === "ar" ? "العنوان التفصيلي" : "Detailed address"}
        {...form.register("detailedAddress")}
      />

      <div className="space-y-3 pt-2">
        <div>
          <h3 className="font-display text-lg text-text">
            {locale === "ar" ? "تحديد الموقع على الخريطة *" : "Pin Location on Map *"}
          </h3>
          <p className="text-sm text-text-soft">
            {locale === "ar"
              ? "يرجى تحديد موقعك الدقيق لضمان وصول المندوب بأسرع وقت."
              : "Please pin your exact location to ensure fast delivery."}
          </p>
        </div>
        <LocationPicker
          locale={locale}
          defaultCenter={
            defaults?.countryCode === "SD"
              ? { lat: 15.5007, lng: 32.5599 } // Khartoum
              : { lat: 30.0444, lng: 31.2357 } // Cairo
          }
          initialLocation={
            defaults?.latitude && defaults?.longitude
              ? { lat: defaults.latitude, lng: defaults.longitude }
              : undefined
          }
          onLocationSelect={(data) => {
            form.setValue("latitude", data.lat, { shouldValidate: true });
            form.setValue("longitude", data.lng, { shouldValidate: true });
            
            // Auto-fill address details from map selection
            if (data.city) form.setValue("city", data.city.toLowerCase());
            if (data.area) form.setValue("area", data.area);
            if (data.address) form.setValue("detailedAddress", data.address);

            // Trigger shipping fee update if city changed
            if (data.city && onCityChange) {
               onCityChange(data.city.toLowerCase() as any);
            }
          }}
        />
        {(form.formState.errors.latitude || form.formState.errors.longitude) && (
          <p className="text-sm text-red-500">
            {locale === "ar" ? "يرجى تحديد الموقع الدقيق على الخريطة" : "Please pin your exact location on the map"}
          </p>
        )}
      </div>

      <Textarea
        placeholder={locale === "ar" ? "ملاحظات الطلب (اختياري)" : "Order notes (optional)"}
        {...form.register("notes")}
      />
      {showSubmit ? (
        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? (locale === "ar" ? "جاري التأكيد..." : "Confirming...") : (locale === "ar" ? "تأكيد الطلب" : "Confirm order")}
        </Button>
      ) : null}
    </form>
  );
}
