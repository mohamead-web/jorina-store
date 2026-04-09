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
          ? "min-w-0 flex-col items-start gap-0.5 rounded-[0.2rem] bg-white px-3 py-2 text-[#201914] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
          : "rounded-full border border-border bg-white/70 px-3 py-2 text-sm text-text-soft sm:text-xs"
      )}
    >
      {isMobileDrawer ? (
        <span className="text-[0.58rem] font-medium uppercase tracking-[0.12em] text-[#8b7f74]">
          {locale === "ar" ? "\u0627\u0644\u062f\u0648\u0644\u0629" : "Country"}
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
            ? "w-full text-[0.88rem] font-medium text-[#201914]"
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
        <option value="EG">{locale === "ar" ? "\u0645\u0635\u0631" : "Egypt"}</option>
        <option value="SD">{locale === "ar" ? "\u0627\u0644\u0633\u0648\u062f\u0627\u0646" : "Sudan"}</option>
      </select>
    </label>
  );
}
