import type { ReactNode } from "react";
import {
  Alexandria,
  Cormorant_Garamond,
  Manrope,
  Noto_Naskh_Arabic
} from "next/font/google";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { GuestStateBridge } from "@/components/layout/guest-state-bridge";
import { Header } from "@/components/layout/header";
import { AppProviders } from "@/components/layout/providers";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { getServerAuthSession } from "@/lib/auth/session";
import { getGuestCartToken, getCartByIdentity } from "@/lib/services/cart";
import { getResolvedPreferences } from "@/lib/services/preferences";
import { getWishlistIds } from "@/lib/services/wishlist";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"]
});

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"]
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"]
});

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!["ar", "en"].includes(locale)) {
    notFound();
  }

  const typedLocale = locale as "ar" | "en";
  const session = await getServerAuthSession();
  const messages = (await import(`../../messages/${typedLocale}.json`)).default;

  // Detect admin route to skip storefront shell
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isAdminRoute = pathname.includes("/admin");

  // Skip heavy storefront queries for admin routes
  if (isAdminRoute) {
    return (
      <AppProviders locale={typedLocale} messages={messages} session={session}>
        <div
          dir={typedLocale === "ar" ? "rtl" : "ltr"}
          className={`locale-${typedLocale} ${manrope.variable} ${alexandria.variable} ${cormorant.variable} ${notoNaskh.variable}`}
        >
          {children}
        </div>
      </AppProviders>
    );
  }

  const preferences = await getResolvedPreferences(session?.user?.id);
  const guestToken = await getGuestCartToken();
  const cart = await getCartByIdentity({
    userId: session?.user?.id,
    guestToken: session?.user?.id ? null : guestToken,
    locale: typedLocale
  });
  const wishlistIds = await getWishlistIds(session?.user?.id);

  return (
    <AppProviders
      locale={typedLocale}
      messages={messages}
      session={session}
      preferences={preferences}
    >
      <div
        dir={typedLocale === "ar" ? "rtl" : "ltr"}
        className={`luxury-shell locale-${typedLocale} ${manrope.variable} ${alexandria.variable} ${cormorant.variable} ${notoNaskh.variable}`}
      >
        <GuestStateBridge locale={typedLocale} />
        <Header
          locale={typedLocale}
          cartCount={cart.totalQuantity}
          wishlistCount={wishlistIds.size}
          countryCode={preferences.countryCode}
          isAuthenticated={Boolean(session?.user)}
        />
        <main className="flex-1 pt-[4.9rem] lg:pt-0">{children}</main>
        <Footer />
        <MobileBottomNav
          locale={typedLocale}
          cartCount={cart.totalQuantity}
          isAuthenticated={Boolean(session?.user)}
        />
      </div>
    </AppProviders>
  );
}
