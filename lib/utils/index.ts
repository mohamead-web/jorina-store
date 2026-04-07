import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { siteConfig } from "@/lib/constants/site";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EXCHANGE_RATES: Record<string, number> = {
  EGP: 1,
  SDG: 55 // Assuming base price in DB is EGP. 1 EGP ≈ 55 SDG. Adjust as needed.
};

export function formatCurrency(value: number, locale: string, currency = "EGP") {
  // Map currencies to specific locales for better formatting
  const currencyLocales: Record<string, string> = {
    EGP: locale === "ar" ? "ar-EG" : "en-EG",
    SDG: locale === "ar" ? "ar-SD" : "en-SD"
  };

  const targetLocale = currencyLocales[currency] || (locale === "ar" ? "ar-EG" : "en-US");
  const convertedValue = value * (EXCHANGE_RATES[currency] || 1);

  return new Intl.NumberFormat(targetLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "SDG" ? 0 : 2
  }).format(convertedValue);
}

export function formatDate(value: Date | string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

export function absoluteUrl(pathname: string) {
  return `${siteConfig.url}${pathname}`;
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
