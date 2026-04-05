"use client";

import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { accountNavigation, mainNavigation } from "@/lib/constants/site";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { CountrySwitcher } from "@/components/navigation/country-switcher";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { Logo } from "@/components/layout/logo";

type HeaderProps = {
  locale: "ar" | "en";
  cartCount: number;
  wishlistCount: number;
  countryCode: "EG";
  isAuthenticated: boolean;
};

export function Header({
  locale,
  cartCount,
  wishlistCount,
  countryCode,
  isAuthenticated
}: HeaderProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="page-section">
          <div className="section-container flex h-[var(--header-height)] items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white/70 text-text lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label={locale === "ar" ? "فتح القائمة" : "Open menu"}
              >
                <Menu className="h-5 w-5" />
              </button>
              <Logo locale={locale} />
            </div>

            <nav className="hidden items-center gap-7 lg:flex">
              {mainNavigation.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm transition-colors",
                      active ? "text-text" : "text-text-soft hover:text-text"
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <CountrySwitcher locale={locale} countryCode={countryCode} />
              <LanguageSwitcher locale={locale} />
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="h-11 w-11 rounded-full p-0">
                <Link href="/search" aria-label={t("common.search")}>
                  <Search className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="relative h-11 w-11 rounded-full p-0">
                <Link href={isAuthenticated ? "/account/favorites" : "/auth/sign-in"}>
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 ? (
                    <span className="absolute -end-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blush px-1 text-[10px] text-white">
                      {wishlistCount}
                    </span>
                  ) : null}
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="relative h-11 w-11 rounded-full p-0">
                <Link href="/cart">
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 ? (
                    <span className="absolute -end-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-text px-1 text-[10px] text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
                <Link href={isAuthenticated ? "/account" : "/auth/sign-in"}>
                  <User className="h-4 w-4" />
                  {isAuthenticated
                    ? t("account.overview")
                    : locale === "ar"
                      ? "دخول"
                      : "Sign in"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/35 transition lg:hidden",
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={cn(
            "absolute inset-y-0 start-0 flex w-[88%] max-w-sm flex-col overflow-y-auto bg-white px-5 py-6 shadow-2xl transition-transform",
            mobileOpen
              ? "translate-x-0"
              : locale === "ar"
                ? "translate-x-full"
                : "-translate-x-full"
          )}
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
          data-lenis-prevent
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <Logo locale={locale} />
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border"
              onClick={() => setMobileOpen(false)}
              aria-label={locale === "ar" ? "إغلاق القائمة" : "Close menu"}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <Link
              href="/search"
              className="flex flex-col items-center justify-center rounded-[1.35rem] border border-border bg-background-soft px-3 py-4 text-center text-xs text-text"
              onClick={() => setMobileOpen(false)}
            >
              <Search className="mb-2 h-4 w-4" />
              {locale === "ar" ? "بحث" : "Search"}
            </Link>
            <Link
              href={isAuthenticated ? "/account/favorites" : "/auth/sign-in"}
              className="flex flex-col items-center justify-center rounded-[1.35rem] border border-border bg-background-soft px-3 py-4 text-center text-xs text-text"
              onClick={() => setMobileOpen(false)}
            >
              <Heart className="mb-2 h-4 w-4" />
              {locale === "ar" ? "المفضلة" : "Favorites"}
            </Link>
            <Link
              href="/cart"
              className="relative flex flex-col items-center justify-center rounded-[1.35rem] border border-border bg-background-soft px-3 py-4 text-center text-xs text-text"
              onClick={() => setMobileOpen(false)}
            >
              <ShoppingBag className="mb-2 h-4 w-4" />
              {locale === "ar" ? "السلة" : "Cart"}
              {cartCount > 0 ? (
                <span className="absolute end-3 top-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-text px-1 text-[10px] text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-transparent bg-background-soft px-4 py-4 text-sm text-text"
                onClick={() => setMobileOpen(false)}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <CountrySwitcher locale={locale} countryCode={countryCode} />
            <LanguageSwitcher locale={locale} />
          </div>

          {isAuthenticated ? (
            <div className="mt-8 rounded-[1.5rem] bg-background-soft p-4">
              <div className="space-y-3">
                {accountNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-sm text-text-soft"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(item.labelKey)}
                  </Link>
                ))}
                <button
                  type="button"
                  className="text-start text-sm text-text-soft"
                  onClick={() => signOut()}
                >
                  {t("account.logout")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
