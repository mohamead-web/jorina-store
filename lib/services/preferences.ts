import { cookies } from "next/headers";

import { cookieKeys } from "@/lib/constants/cookies";
import { prisma } from "@/lib/db/prisma";
import { preferenceSchema, type PreferenceInput } from "@/lib/validators/preferences";
import type { AppCountry, AppCurrency, AppLocale } from "@/types/domain";

export const availableLanguages = [
  { code: "ar", label: "Ø§ÙØ¹Ø±Ø¨ÙØ©", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" }
] as const;

export const availableCountries = [
  { code: "EG", label: "ÙØµØ±", shippingFee: 50, currency: "EGP" },
  { code: "SD", label: "Ø§ÙØ³ÙØ¯Ø§Ù", shippingFee: 0, currency: "SDG" }
] as const;

const supportedCountryRecords = [
  {
    code: "EG" as const,
    name: "Egypt",
    nativeName: "مصر",
    phoneCode: "+20",
    currencyCode: "EGP" as const,
    defaultShippingFee: 50
  },
  {
    code: "SD" as const,
    name: "Sudan",
    nativeName: "السودان",
    phoneCode: "+249",
    currencyCode: "SDG" as const,
    defaultShippingFee: 0
  }
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

let supportedCountriesPromise: Promise<void> | null = null;

async function ensureSupportedCountries() {
  if (!supportedCountriesPromise) {
    supportedCountriesPromise = prisma
      .$transaction(
        supportedCountryRecords.map((country) =>
          prisma.country.upsert({
            where: { code: country.code },
            update: {
              name: country.name,
              nativeName: country.nativeName,
              phoneCode: country.phoneCode,
              currencyCode: country.currencyCode,
              defaultShippingFee: country.defaultShippingFee
            },
            create: country
          })
        )
      )
      .then(() => undefined)
      .catch((error) => {
        supportedCountriesPromise = null;
        throw error;
      });
  }

  return supportedCountriesPromise;
}

export async function getResolvedPreferences(userId?: string | null) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(cookieKeys.localePreference)?.value;
  const cookieCountry = cookieStore.get(cookieKeys.countryPreference)?.value;

  if (cookieCountry === "SD") {
    await ensureSupportedCountries();
  }

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

  const resolvedCountry =
    cookieCountry === "SD"
      ? "SD"
      : cookieCountry === "EG"
        ? "EG"
        : defaultPreference.countryCode;

  return {
    ...defaultPreference,
    localeCode: cookieLocale === "en" ? "en" : defaultPreference.localeCode,
    countryCode: resolvedCountry,
    currencyCode: resolvedCountry === "SD" ? "SDG" : "EGP"
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

  if (payload.countryCode === "SD") {
    await ensureSupportedCountries();
  }

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
