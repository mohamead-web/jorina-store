"use client";

import { MapPin } from "lucide-react";
import { startTransition } from "react";

import { updatePreferencesAction } from "@/lib/actions/preference-actions";

import { type AppCountry } from "@/types/domain";

export function CountrySwitcher({
  locale,
  countryCode
}: {
  locale: "ar" | "en";
  countryCode: AppCountry;
}) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-2 text-sm text-text-soft sm:text-xs">
      <MapPin className="h-4 w-4" />
      <select
        value={countryCode}
        className="bg-transparent text-[16px] text-text sm:text-sm"
        onChange={(event) => {
          startTransition(() => {
            void updatePreferencesAction({
              localeCode: locale,
              countryCode: event.target.value as "EG"
            });
          });
        }}
      >
        <option value="EG">
          {locale === "ar" ? "مصر" : "Egypt"}
        </option>
        <option value="SD">
          {locale === "ar" ? "السودان" : "Sudan"}
        </option>
      </select>
    </label>
  );
}
