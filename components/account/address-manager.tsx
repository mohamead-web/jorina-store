"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  deleteAddressAction,
  saveAddressAction
} from "@/lib/actions/account-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  addressSchema,
  type AddressFormValues
} from "@/lib/validators/address";
import { LocationPicker } from "@/components/ui/location-picker";
import { MapPin } from "lucide-react";

export function AddressManager({
  locale,
  addresses
}: {
  locale: "ar" | "en";
  addresses: Array<{
    id: string;
    label: string;
    fullName: string;
    phoneNumber: string;
    countryCode: "EG" | "SD";
    city: string;
    area: string;
    detailedAddress: string;
    notes: string | null;
    isDefault: boolean;
    latitude?: number | null;
    longitude?: number | null;
  }>;
}) {
  const router = useRouter();
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "",
      type: "HOME",
      fullName: "",
      phoneNumber: "",
      countryCode: "EG",
      city: "",
      area: "",
      detailedAddress: "",
      notes: "",
      isDefault: addresses.length === 0,
    }
  });

  const countryCodeVal = useWatch({
    control: form.control,
    name: "countryCode"
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="grid gap-4">
        {addresses.map((address) => (
          <div key={address.id} className="premium-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl text-text">{address.label}</h3>
                <p className="mt-2 text-sm text-text-soft">
                  {address.fullName} · {address.phoneNumber} · {address.countryCode === "SD" ? "🇸🇩" : "🇪🇬"}
                </p>
                <p className="mt-2 text-sm leading-7 text-text-soft flex items-center gap-1">
                  {address.city} · {address.area} · {address.detailedAddress}
                  {address.latitude && address.longitude ? (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-blush-soft px-1.5 py-0.5 text-[10px] text-blush-strong ml-2">
                       <MapPin className="h-3 w-3" />
                       {locale === "ar" ? "موقع دقيق" : "Precise Location"}
                    </span>
                  ) : null}
                </p>
              </div>
              {address.isDefault ? (
                <span className="rounded-full bg-background-soft px-3 py-1 text-xs text-text">
                  {locale === "ar" ? "افتراضي" : "Default"}
                </span>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              className="mt-4"
              onClick={() => {
                startTransition(async () => {
                  try {
                    await deleteAddressAction(locale, address.id);
                    router.refresh();
                    toast.success(
                      locale === "ar" ? "تم حذف العنوان" : "Address removed"
                    );
                  } catch (error) {
                    toast.error(locale === "ar" ? "حدث خطأ أثناء الحذف" : "Error removing address");
                  }
                });
              }}
            >
              {locale === "ar" ? "حذف" : "Delete"}
            </Button>
          </div>
        ))}
      </div>

      <form
        className="premium-card space-y-4 p-5"
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            try {
              await saveAddressAction(locale, values);
              form.reset();
              router.refresh();
              toast.success(
                locale === "ar" ? "تم حفظ العنوان" : "Address saved"
              );
            } catch (error) {
              toast.error(locale === "ar" ? "حدث خطأ أثناء الحفظ" : "Error saving address");
            }
          });
        })}
      >
        <h3 className="font-display text-3xl text-text">
          {locale === "ar" ? "إضافة عنوان جديد" : "Add a new address"}
        </h3>
        <Input placeholder={locale === "ar" ? "اسم العنوان" : "Address label"} {...form.register("label")} />
        <Input placeholder={locale === "ar" ? "الاسم الكامل" : "Full name"} {...form.register("fullName")} />
        <Input placeholder={locale === "ar" ? "رقم الهاتف" : "Phone number"} {...form.register("phoneNumber")} />
        <select
          className="flex h-11 w-full rounded-md border border-black/10 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/20"
          {...form.register("countryCode")}
        >
          <option value="EG">{locale === "ar" ? "مصر" : "Egypt"}</option>
          <option value="SD">{locale === "ar" ? "السودان" : "Sudan"}</option>
        </select>
        <Input placeholder={locale === "ar" ? "المدينة" : "City"} {...form.register("city")} />
        <Input placeholder={locale === "ar" ? "الحي / المنطقة" : "Area / district"} {...form.register("area")} />
        <Textarea
          placeholder={
            locale === "ar" ? "العنوان التفصيلي" : "Detailed address"
          }
          {...form.register("detailedAddress")}
        />

        <div className="space-y-3 pt-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-text">
              {locale === "ar" ? "تحديد الموقع على الخريطة *" : "Pin Location on Map *"}
            </h3>
          </div>
          <LocationPicker
            locale={locale}
            defaultCenter={
              countryCodeVal === "SD"
                ? { lat: 15.5007, lng: 32.5599 }
                : { lat: 30.0444, lng: 31.2357 }
            }
            onLocationSelect={(data) => {
              form.setValue("latitude", data.lat, { shouldValidate: true });
              form.setValue("longitude", data.lng, { shouldValidate: true });
              
              // Auto-fill address details
              if (data.city) form.setValue("city", data.city);
              if (data.area) form.setValue("area", data.area);
              if (data.address) form.setValue("detailedAddress", data.address);
            }}
          />
          {(form.formState.errors.latitude || form.formState.errors.longitude) && (
             <p className="text-xs text-red-500">
               {locale === "ar" ? "يرجى تحديد الموقع على الخريطة أولاً" : "Please pin your location first"}
             </p>
          )}
        </div>

        <Textarea
          placeholder={locale === "ar" ? "ملاحظات إضافية" : "Additional notes"}
          {...form.register("notes")}
        />
        <label className="flex items-center gap-2 text-sm text-text-soft">
          <input type="checkbox" {...form.register("isDefault")} />
          {locale === "ar" ? "اجعليه العنوان الافتراضي" : "Set as default address"}
        </label>
        <Button type="submit" className="w-full">
          {locale === "ar" ? "حفظ العنوان" : "Save address"}
        </Button>
      </form>
    </div>
  );
}
