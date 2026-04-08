"use client";

import { useState } from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { LocationModal } from "./location-modal";

interface LocationPickerProps {
  locale: "ar" | "en";
  onLocationSelect: (data: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    area: string;
  }) => void;
  initialLocation?: { lat: number; lng: number };
  defaultCenter?: { lat: number; lng: number };
}

export function LocationPicker({
  locale,
  onLocationSelect,
  initialLocation,
  defaultCenter
}: LocationPickerProps) {
  const t = useTranslations("location");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasLocation, setHasLocation] = useState(Boolean(initialLocation));

  return (
    <div className="space-y-4">
      {!hasLocation ? (
        <Button
          type="button"
          variant="secondary"
          className="group h-16 w-full rounded-[1.4rem] border-2 border-dashed border-blush/30 bg-blush/5 transition-all hover:border-blush/50 hover:bg-blush/10"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-110">
              <MapPin className="h-5 w-5 text-blush" />
            </div>
            <span className="font-semibold text-text">{t("pinLocation")}</span>
          </div>
        </Button>
      ) : (
        <div className="premium-card flex items-center justify-between gap-4 border-blush/20 bg-blush/[0.02] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blush/10">
              <CheckCircle2 className="h-5 w-5 text-blush" />
            </div>
            <div>
              <p className="text-sm font-bold text-text">{t("locationSelected")}</p>
              <p className="text-xs text-text-muted">
                {locale === "ar"
                  ? "تم تحديد إحداثيات التوصيل"
                  : "Delivery coordinates pinned"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="font-bold text-blush hover:text-blush-strong"
            onClick={() => setIsModalOpen(true)}
          >
            {t("changeLocation")}
          </Button>
        </div>
      )}

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        locale={locale}
        initialLocation={initialLocation || defaultCenter}
        onConfirm={(data) => {
          setHasLocation(true);
          onLocationSelect(data);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
