import { cookies } from "next/headers";

import { cookieKeys } from "@/lib/constants/cookies";
import { prisma } from "@/lib/db/prisma";
import { preferenceSchema, type PreferenceInput } from "@/lib/validators/preferences";
import type { AppCountry, AppCurrency, AppLocale } from "@/types/domain";

export const availableLanguages = [
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" }
] as const;

export const availableCountries = [
  { code: "EG", label: "مصر", shippingFee: 50, currency: "EGP" },
  { code: "SD", label: "السودان", shippingFee: 0, currency: "SDG" }
] as const;

const defaultPreference = {
  localeCode: "ar" as const,
  countryCode: "EG" as const,
  currencyCode: "EGP" as const
};

export type ResolvedPreference = {
  localeCode: AppLocale;
  countryCode: AppCountry;
  currencyCode: AppCurrency;
};

export async function getResolvedPreferences(userId?: string | null) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(cookieKeys.localePreference)?.value;
  const cookieCountry = cookieStore.get(cookieKeys.countryPreference)?.value;

  if (userId) {
    const preference = await prisma.userPreference.findUnique({
      where: { userId }
    });

    if (preference) {
      return {
        localeCode: (preference.localeCode === "en" ? "en" : "ar") as AppLocale,
        countryCode: (preference.countryCode === "SD" ? "SD" : "EG") as AppCountry,
        currencyCode: (preference.countryCode === "SD" ? "SDG" : "EGP") as AppCurrency
      } satisfies ResolvedPreference;
    }
  }

  return {
    ...defaultPreference,
    localeCode: cookieLocale === "en" ? "en" : defaultPreference.localeCode,
    countryCode: cookieCountry === "SD" ? "SD" : (cookieCountry === "EG" ? "EG" : defaultPreference.countryCode)
  } satisfies ResolvedPreference;
}

export async function writeGuestPreferences(input: PreferenceInput) {
  const payload = preferenceSchema.parse(input);
  const cookieStore = await cookies();

  cookieStore.set(cookieKeys.localePreference, payload.localeCode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });
  cookieStore.set(cookieKeys.countryPreference, payload.countryCode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });

  return payload;
}

export async function saveUserPreferences(userId: string, input: PreferenceInput) {
  const payload = preferenceSchema.parse(input);

  await prisma.userPreference.upsert({
    where: { userId },
    update: {
      localeCode: payload.localeCode,
      countryCode: payload.countryCode,
      currencyCode: payload.countryCode === "SD" ? "SDG" : "EGP"
    },
    create: {
      userId,
      localeCode: payload.localeCode,
      countryCode: payload.countryCode,
      currencyCode: payload.countryCode === "SD" ? "SDG" : "EGP"
    }
  });

  return payload;
}

export async function mergeGuestPreferencesIntoUser(userId: string) {
  const preference = await getResolvedPreferences();
  await saveUserPreferences(userId, {
    localeCode: preference.localeCode,
    countryCode: preference.countryCode
  });
}
