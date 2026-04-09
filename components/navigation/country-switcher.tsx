"use client";

import { MapPin } from "lucide-react";
import { startTransition } from "react";
import { useRouter } from "next/navigation";

import { updatePreferencesAction } from "@/lib/actions/preference-actions";
import { type AppCountry } from "@/types/domain";
import { cn } from "@/lib/utils";

export function CountrySwitcher({
  locale,
  countryCode,
  variant = "default"
}: {
  locale: "ar" | "en";
  countryCode: AppCountry;
  variant?: "default" | "drawer";
}) {
  const router = useRouter();
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
        <MapPin className="h-4 w-4" />
        {isDrawer ? (locale === "ar" ? "الدولة" : "Country") : null}
      </span>
      <select
        value={countryCode}
        className={cn(
          "bg-transparent text-text",
          isDrawer ? "text-sm" : "text-[16px] sm:text-sm"
        )}
        onChange={(event) => {
          const newCountry = event.target.value as AppCountry;
          startTransition(async () => {
            await updatePreferencesAction({
              localeCode: locale,
              countryCode: newCountry
            });
            router.refresh();
          });
        }}
      >
        <option value="EG">{locale === "ar" ? "مصر" : "Egypt"}</option>
        <option value="SD">{locale === "ar" ? "السودان" : "Sudan"}</option>
      </select>
    </label>
  );
}
