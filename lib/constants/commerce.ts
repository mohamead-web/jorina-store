import type { AppCountry } from "@/types/domain";

export const returnWindowDays = 7;

export const shippingCityRates = {
  EG: {
    cairo: 50,
    giza: 50,
    alexandria: 60,
    other: 80
  },
  SD: {
    khartoum: 0,
    omdurman: 0,
    bahri: 0,
    other: 0
  }
} as const;

export type ShippingCityCode =
  | keyof typeof shippingCityRates.EG
  | keyof typeof shippingCityRates.SD;

export function getDefaultShippingCity(countryCode: AppCountry): ShippingCityCode {
  return countryCode === "SD" ? "khartoum" : "cairo";
}

export function getShippingFeeForLocation(countryCode: AppCountry, city?: string) {
  const normalizedCity = city?.toLowerCase();

  if (countryCode === "SD") {
    if (
      normalizedCity === "khartoum" ||
      normalizedCity === "omdurman" ||
      normalizedCity === "bahri" ||
      normalizedCity === "other"
    ) {
      return shippingCityRates.SD[normalizedCity];
    }

    return shippingCityRates.SD.khartoum;
  }

  if (
    normalizedCity === "cairo" ||
    normalizedCity === "giza" ||
    normalizedCity === "alexandria" ||
    normalizedCity === "other"
  ) {
    return shippingCityRates.EG[normalizedCity];
  }

  return shippingCityRates.EG.cairo;
}

export const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED"
] as const;

export const returnStatuses = [
  "REQUESTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "RECEIVED",
  "REFUNDED"
] as const;
