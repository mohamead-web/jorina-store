"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition } from "react";
import { useForm } from "react-hook-form";
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
    city: string;
    area: string;
    detailedAddress: string;
    notes: string | null;
    isDefault: boolean;
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
      isDefault: addresses.length === 0
    }
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
                  {address.fullName} · {address.phoneNumber}
                </p>
                <p className="mt-2 text-sm leading-7 text-text-soft">
                  {address.city} · {address.area} · {address.detailedAddress}
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
                  await deleteAddressAction(locale, address.id);
                  router.refresh();
                  toast.success(
                    locale === "ar" ? "تم حذف العنوان" : "Address removed"
                  );
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
            await saveAddressAction(locale, values);
            form.reset();
            router.refresh();
            toast.success(
              locale === "ar" ? "تم حفظ العنوان" : "Address saved"
            );
          });
        })}
      >
        <h3 className="font-display text-3xl text-text">
          {locale === "ar" ? "إضافة عنوان جديد" : "Add a new address"}
        </h3>
        <Input placeholder={locale === "ar" ? "اسم العنوان" : "Address label"} {...form.register("label")} />
        <Input placeholder={locale === "ar" ? "الاسم الكامل" : "Full name"} {...form.register("fullName")} />
        <Input placeholder={locale === "ar" ? "رقم الهاتف" : "Phone number"} {...form.register("phoneNumber")} />
        <Input placeholder={locale === "ar" ? "المدينة" : "City"} {...form.register("city")} />
        <Input placeholder={locale === "ar" ? "الحي / المنطقة" : "Area / district"} {...form.register("area")} />
        <Textarea
          placeholder={
            locale === "ar" ? "العنوان التفصيلي" : "Detailed address"
          }
          {...form.register("detailedAddress")}
        />
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
