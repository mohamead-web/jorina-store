"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { X, Search, Crosshair, MapPin, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reverseGeocode, searchLocation } from "@/lib/services/location-service";
import { useTranslations } from "next-intl";

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-blush" />
    </div>
  ),
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
  initialLocation,
}: LocationModalProps) {
  const t = useTranslations("location");
  const [coords, setCoords] = useState(initialLocation || { lat: 30.0444, lng: 31.2357 });
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
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
      fetchAddress(coords.lat, coords.lng);
    }
  }, [isOpen, coords.lat, coords.lng, fetchAddress]);

  if (!isOpen) return null;

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(newCoords);
      });
    }
  };

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocation(val);
        setSearchResults(results);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="location-modal-overlay">
      {/* Header */}
      <div className="location-modal-header">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          {locale === "ar" ? <ArrowRight className="h-6 w-6" /> : <ArrowLeft className="h-6 w-6" />}
        </button>
        <h1 className="flex-1 text-center font-display text-xl pt-1">
          {t("addNewAddress")}
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Map Content */}
      <div className="location-modal-map-container">
        {/* Search Bar */}
        <div className="absolute left-4 right-4 top-4 z-[1001] flex flex-col gap-2">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blush transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-14 w-full rounded-2xl border-none bg-white px-12 text-sm shadow-xl outline-none focus:ring-2 focus:ring-blush"
              dir={locale === "ar" ? "rtl" : "ltr"}
            />
            {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-blush" />}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results-container p-2">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 rounded-xl text-start transition-colors border-b last:border-0 border-gray-100"
                  onClick={() => {
                    const newCoords = { lat: res.lat, lng: res.lng };
                    setCoords(newCoords);
                    setSearchResults([]);
                    setSearchQuery("");
                  }}
                >
                  <MapPin className="h-5 w-5 shrink-0 text-gray-400 mt-0.5" />
                  <span className="text-sm text-text-soft line-clamp-2">{res.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Use Support Location Button */}
        <button
          onClick={handleGetCurrentLocation}
          className="absolute right-4 bottom-4 z-[1001] h-12 px-6 rounded-full bg-white shadow-xl flex items-center gap-2 text-sm font-semibold text-text hover:bg-gray-50 transition-all active:scale-95"
        >
          <Crosshair className="h-5 w-5 text-blush" />
          {t("useCurrentLocation")}
        </button>

        {/* Center Pin Overlay */}
        <div className="location-modal-center-pin">
          <div className="location-modal-pin-label">
            {t("deliveryPin")}
          </div>
          <div className="relative h-12 w-12">
             <div className="absolute inset-0 bg-blush/20 rounded-full animate-ping" />
             <MapPin className="relative h-12 w-12 text-blush drop-shadow-lg" />
          </div>
        </div>

        <MapComponent
          center={coords}
          onLocationChange={(lat, lng) => {
            const newCoords = { lat, lng };
            setCoords(newCoords);
          }}
        />
      </div>

      {/* Bottom Bar */}
      <div className="location-modal-bottom-bar space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 bg-background-soft rounded-2xl flex items-center justify-center">
            <MapPin className="h-6 w-6 text-blush" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">
              {t("currentLocation")}
            </p>
            <p className="text-sm font-semibold text-text line-clamp-2 leading-relaxed">
              {loading ? t("loadingAddress") : address || t("pinLocation")}
            </p>
          </div>
        </div>
        
        <Button
          disabled={loading || !address}
          onClick={() => onConfirm({ lat: coords.lat, lng: coords.lng, address, city, area })}
          className="w-full h-14 rounded-2xl text-base shadow-lg shadow-blush/20"
        >
          {t("confirmLocation")}
        </Button>
      </div>
    </div>
  );
}
