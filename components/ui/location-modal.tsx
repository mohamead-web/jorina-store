"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
  Crosshair,
  Loader2,
  MapPin,
  Search
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  reverseGeocode,
  searchLocation
} from "@/lib/services/location-service";

const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-blush" />
    </div>
  )
});

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    area: string;
  }) => void;
  locale: "ar" | "en";
  initialLocation?: { lat: number; lng: number };
}

export function LocationModal({
  isOpen,
  onClose,
  onConfirm,
  locale,
  initialLocation
}: LocationModalProps) {
  const t = useTranslations("location");
  const [coords, setCoords] = useState(
    initialLocation || { lat: 30.0444, lng: 31.2357 }
  );
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ label: string; lat: number; lng: number }>
  >([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    const result = await reverseGeocode(lat, lng);

    if (result) {
      setAddress(result.address);
      setCity(result.city);
      setArea(result.area);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      void fetchAddress(coords.lat, coords.lng);
    }
  }, [coords.lat, coords.lng, fetchAddress, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocation(value);
        setSearchResults(results);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="location-modal-overlay">
      <div className="location-modal-header">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
        >
          {locale === "ar" ? (
            <ArrowRight className="h-6 w-6" />
          ) : (
            <ArrowLeft className="h-6 w-6" />
          )}
        </button>
        <h1 className="flex-1 pt-1 text-center font-display text-xl">
          {t("addNewAddress")}
        </h1>
        <div className="w-10" />
      </div>

      <div className="location-modal-map-container">
        <div className="absolute left-4 right-4 top-4 z-[1001] flex flex-col gap-2">
          <div className="group relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blush" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-14 w-full rounded-2xl border-none bg-white px-12 text-sm shadow-xl outline-none focus:ring-2 focus:ring-blush"
              dir={locale === "ar" ? "rtl" : "ltr"}
            />
            {loading ? (
              <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-blush" />
            ) : null}
          </div>

          {searchResults.length > 0 ? (
            <div className="search-results-container p-2">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.lat}-${result.lng}-${index}`}
                  type="button"
                  className="w-full rounded-xl border-b border-gray-100 p-4 text-start transition-colors last:border-0 hover:bg-gray-50"
                  onClick={() => {
                    setCoords({ lat: result.lat, lng: result.lng });
                    setSearchResults([]);
                    setSearchQuery("");
                  }}
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                    <span className="line-clamp-2 text-sm text-text-soft">
                      {result.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="absolute bottom-4 right-4 z-[1001] flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-text shadow-xl transition-all active:scale-95 hover:bg-gray-50"
        >
          <Crosshair className="h-5 w-5 text-blush" />
          {t("useCurrentLocation")}
        </button>

        <div className="location-modal-center-pin">
          <div className="location-modal-pin-label">{t("deliveryPin")}</div>
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-blush/20" />
            <MapPin className="relative h-12 w-12 text-blush drop-shadow-lg" />
          </div>
        </div>

        <MapComponent
          center={coords}
          onLocationChange={(lat, lng) => {
            setCoords({ lat, lng });
          }}
        />
      </div>

      <div className="location-modal-bottom-bar space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background-soft">
            <MapPin className="h-6 w-6 text-blush" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              {t("currentLocation")}
            </p>
            <p className="line-clamp-2 text-sm font-semibold leading-relaxed text-text">
              {loading ? t("loadingAddress") : address || t("pinLocation")}
            </p>
          </div>
        </div>

        <Button
          disabled={loading || !address}
          onClick={() =>
            onConfirm({
              lat: coords.lat,
              lng: coords.lng,
              address,
              city,
              area
            })
          }
          className="h-14 w-full rounded-2xl text-base shadow-lg shadow-blush/20"
        >
          {t("confirmLocation")}
        </Button>
      </div>
    </div>
  );
}
