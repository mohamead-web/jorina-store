"use client";

import { Globe } from "lucide-react";
import { startTransition } from "react";

import { updatePreferencesAction } from "@/lib/actions/preference-actions";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { type AppCountry } from "@/types/domain";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  locale,
  countryCode,
  variant = "default"
}: {
  locale: "ar" | "en";
  countryCode: AppCountry;
  variant?: "default" | "drawer";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isDrawer = variant === "drawer";

  return (
    <label
      className={cn(
        "flex items-center gap-2",
        isDrawer
          ? "w-full justify-between rounded-[1.1rem] border border-black/10 bg-[#f8f7f4] px-4 py-3.5 text-sm text-text"
          : "rounded-full border border-border bg-white/70 px-3 py-2 text-sm text-text-soft sm:text-xs"
      )}
    >
      <span className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        {isDrawer ? (locale === "ar" ? "اللغة" : "Language") : null}
      </span>
      <select
        value={locale}
        className={cn(
          "bg-transparent text-text",
          isDrawer ? "text-sm" : "text-[16px] sm:text-sm"
        )}
        onChange={(event) => {
          const nextLocale = event.target.value as "ar" | "en";
          startTransition(async () => {
            await updatePreferencesAction({
              localeCode: nextLocale,
              countryCode
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
