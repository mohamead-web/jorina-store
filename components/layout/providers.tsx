"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { createContext, useContext, useState } from "react";
import { Toaster } from "sonner";

import { SmoothScrollProvider } from "@/components/layout/smooth-scroll-provider";
import type { AppLocale, AppCountry, AppCurrency } from "@/types/domain";

export type ResolvedPreferenceContextType = {
  localeCode: AppLocale;
  countryCode: AppCountry;
  currencyCode: AppCurrency;
};

const PreferencesContext = createContext<ResolvedPreferenceContextType>({
  localeCode: "ar",
  countryCode: "EG",
  currencyCode: "EGP"
});

export function usePreferences() {
  return useContext(PreferencesContext);
}

export function AppProviders({
  children,
  locale,
  messages,
  session,
  preferences
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
  session: unknown;
  preferences?: ResolvedPreferenceContextType;
}) {
  const [queryClient] = useState(() => new QueryClient());
  
  const ctxValue = preferences ?? {
    localeCode: (locale === "en" ? "en" : "ar") as AppLocale,
    countryCode: "EG" as AppCountry,
    currencyCode: "EGP" as AppCurrency
  };

  return (
    <PreferencesContext.Provider value={ctxValue}>
      <SessionProvider session={session as never}>
        <QueryClientProvider client={queryClient}>
          <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Riyadh">
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
            <Toaster
              position={locale === "ar" ? "top-left" : "top-right"}
              richColors
              toastOptions={{
                className:
                  "!rounded-[1.3rem] !border !border-border !bg-white !text-text !shadow-[0_24px_45px_-24px_rgba(17,12,12,0.28)]"
              }}
            />
          </NextIntlClientProvider>
        </QueryClientProvider>
      </SessionProvider>
    </PreferencesContext.Provider>
  );
}
