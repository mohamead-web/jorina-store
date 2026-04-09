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
  variant?: "default" | "mobileDrawer";
}) {
  const router = useRouter();
  const isMobileDrawer = variant === "mobileDrawer";

  return (
    <label
      className={cn(
        "flex items-center gap-2",
        isMobileDrawer
          ? "min-w-0 flex-col items-start gap-1 rounded-[0.45rem] bg-white px-3 py-2.5 text-[#201914] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
          : "rounded-full border border-border bg-white/70 px-3 py-2 text-sm text-text-soft sm:text-xs"
      )}
    >
      {isMobileDrawer ? (
        <span className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[#8b7f74]">
          {locale === "ar" ? "الدولة" : "Country"}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
        </span>
      )}

      <select
        value={countryCode}
        className={cn(
          "bg-transparent text-text outline-none",
          isMobileDrawer
            ? "w-full text-[0.95rem] font-medium text-[#201914]"
            : "text-[16px] sm:text-sm"
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
