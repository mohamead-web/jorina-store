"use client";

import { useState } from "react";
import { MapPin, CheckCircle2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationModal } from "./location-modal";
import { useTranslations } from "next-intl";

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
  defaultCenter,
}: LocationPickerProps) {
  const t = useTranslations("location");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasLocation, setHasLocation] = useState(!!initialLocation);

  return (
    <div className="space-y-4">
      {!hasLocation ? (
        <Button
          type="button"
          variant="secondary"
          className="w-full h-16 rounded-[1.4rem] border-dashed border-2 border-blush/30 bg-blush/5 hover:bg-blush/10 hover:border-blush/50 transition-all group"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <MapPin className="h-5 w-5 text-blush" />
            </div>
            <span className="font-semibold text-text">
              {t("pinLocation")}
            </span>
          </div>
        </Button>
      ) : (
        <div className="premium-card p-4 flex items-center justify-between gap-4 border-blush/20 bg-blush/[0.02]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blush/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-blush" />
            </div>
            <div>
              <p className="text-sm font-bold text-text">{t("locationSelected")}</p>
              <p className="text-xs text-text-muted">{locale === "ar" ? "تم تحديد إحداثيات التوصيل" : "Delivery coordinates pinned"}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-blush hover:text-blush-strong font-bold"
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
