"use client";

import { useTranslations } from "next-intl";

export function AnnouncementBar() {
  const t = useTranslations("announcement");

  return (
    <div className="border-b border-border bg-white/90 px-4 py-3 text-center text-xs text-text-soft">
      {t("text")}
    </div>
  );
}
