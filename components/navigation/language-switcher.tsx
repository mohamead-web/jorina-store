"use client";

import { Globe } from "lucide-react";
import { startTransition } from "react";

import { updatePreferencesAction } from "@/lib/actions/preference-actions";
import { usePathname, useRouter } from "@/lib/i18n/navigation";

export function LanguageSwitcher({ locale }: { locale: "ar" | "en" }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-2 text-sm text-text-soft sm:text-xs">
      <Globe className="h-4 w-4" />
      <select
        value={locale}
        className="bg-transparent text-[16px] text-text sm:text-sm"
        onChange={(event) => {
          const nextLocale = event.target.value as "ar" | "en";
          startTransition(() => {
            void updatePreferencesAction({
              localeCode: nextLocale,
              countryCode: "EG"
            });
            router.replace(pathname, { locale: nextLocale });
          });
        }}
      >
        <option value="ar">العربية</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}
