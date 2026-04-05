"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updatePreferencesAction } from "@/lib/actions/preference-actions";
import { SignOutButton } from "@/components/navigation/sign-out-button";
import { Button } from "@/components/ui/button";

export function SettingsPanel({
  locale,
  currentLocale,
  currentCountry,
  profile
}: {
  locale: "ar" | "en";
  currentLocale: "ar" | "en";
  currentCountry: "EG";
  profile: {
    name?: string | null;
    email?: string | null;
  };
}) {
  const router = useRouter();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr]">
      <form
        className="premium-card space-y-4 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);

          startTransition(async () => {
            await updatePreferencesAction({
              localeCode: formData.get("localeCode"),
              countryCode: formData.get("countryCode")
            });
            router.refresh();
            toast.success(
              locale === "ar" ? "تم حفظ التفضيلات" : "Preferences saved"
            );
          });
        }}
      >
        <h2 className="font-display text-3xl text-text">
          {locale === "ar" ? "التفضيلات" : "Preferences"}
        </h2>
        <label className="grid gap-2 text-sm text-text-soft">
          <span>{locale === "ar" ? "اللغة" : "Language"}</span>
          <select
            name="localeCode"
            defaultValue={currentLocale}
            className="h-12 rounded-[1.15rem] border border-border bg-white/80 px-4 text-base text-text sm:text-sm"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-text-soft">
          <span>{locale === "ar" ? "الدولة" : "Country"}</span>
          <select
            name="countryCode"
            defaultValue={currentCountry}
            className="h-12 rounded-[1.15rem] border border-border bg-white/80 px-4 text-base text-text sm:text-sm"
          >
            <option value="EG">
              {locale === "ar" ? "مصر" : "Egypt"}
            </option>
          </select>
        </label>
        <Button type="submit">
          {locale === "ar" ? "حفظ التفضيلات" : "Save preferences"}
        </Button>
      </form>

      <div className="space-y-6">
        <div className="premium-card p-5">
          <h2 className="font-display text-3xl text-text">
            {locale === "ar" ? "الملف الشخصي" : "Profile"}
          </h2>
          <div className="mt-4 space-y-2 text-sm text-text-soft">
            <p>{profile.name || (locale === "ar" ? "بدون اسم" : "No name")}</p>
            <p>{profile.email || "—"}</p>
          </div>
        </div>
        <div className="premium-card p-5">
          <h2 className="font-display text-3xl text-text">
            {locale === "ar" ? "الحساب" : "Account"}
          </h2>
          <p className="mt-4 text-sm leading-7 text-text-soft">
            {locale === "ar"
              ? "يتم حفظ الطلبات، العناوين، والمفضلة ضمن حسابك الحالي."
              : "Orders, saved addresses and favorites remain attached to your current account."}
          </p>
          <div className="mt-5">
            <SignOutButton locale={locale} />
          </div>
        </div>
        <div className="premium-card p-5">
          <h2 className="font-display text-3xl text-text">
            {locale === "ar" ? "طريقة الدفع" : "Payment method"}
          </h2>
          <p className="mt-4 text-sm leading-7 text-text-soft">
            {locale === "ar"
              ? "الدفع عند الاستلام هو الخيار المتاح حاليًا، وقد تم تجهيز البنية لإضافة بوابات دفع إلكترونية لاحقًا."
              : "Cash on delivery is currently available, and the architecture is prepared for future online payment gateways."}
          </p>
        </div>
      </div>
    </div>
  );
}
