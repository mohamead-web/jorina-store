"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { type ComponentType, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/layout/logo";
import { CountrySwitcher } from "@/components/navigation/country-switcher";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { Button } from "@/components/ui/button";
import { mainNavigation } from "@/lib/constants/site";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { type AppCountry } from "@/types/domain";

type HeaderProps = {
  locale: "ar" | "en";
  cartCount: number;
  wishlistCount: number;
  countryCode: AppCountry;
  isAuthenticated: boolean;
};

function MobileActionLink({
  href,
  label,
  icon: Icon,
  badge,
  onClick
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      onClick={onClick}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-text transition hover:bg-black/[0.04]"
    >
      <Icon className="h-5 w-5" />
      {badge ? (
        <span className="absolute -end-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-text px-1 text-[10px] text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function MobileQuickLink({
  href,
  icon: Icon,
  label,
  badge,
  onClick
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative flex min-h-24 flex-col items-center justify-center rounded-[1.45rem] border border-black/10 bg-[#f8f7f4] px-3 py-4 text-center text-sm text-text shadow-[0_16px_34px_-28px_rgba(17,12,8,0.28)] transition hover:border-black/15 hover:bg-white"
    >
      <Icon className="h-5 w-5" />
      <span className="mt-2 text-sm">{label}</span>
      {badge ? (
        <span className="absolute left-3 top-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-text px-1 text-[10px] text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function Header({
  locale,
  cartCount,
  wishlistCount,
  countryCode,
  isAuthenticated
}: HeaderProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const mobileOpen = mobileOpenPath === pathname;

  const openMobileMenu = () => setMobileOpenPath(pathname);
  const closeMobileMenu = () => setMobileOpenPath(null);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("overflow");
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const drawerDirectionOffset = locale === "ar" ? 72 : -72;
  const overlayTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] };
  const drawerTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.36, ease: [0.22, 1, 0.36, 1] };
  const itemTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] };

  const accountHref = isAuthenticated ? "/account" : "/auth/sign-in";
  const accountLabel = isAuthenticated
    ? t("account.overview")
    : locale === "ar"
      ? "الحساب"
      : "Account";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="page-section">
          <div className="section-container">
            <div className="flex h-[var(--header-height)] items-center justify-between gap-3 lg:hidden">
              <div className="flex shrink-0 items-center gap-2">
                <Logo locale={locale} />
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-text shadow-[0_10px_24px_-18px_rgba(17,12,8,0.3)] transition hover:border-black/15 hover:bg-[#faf9f6]"
                  onClick={openMobileMenu}
                  aria-label={locale === "ar" ? "فتح القائمة" : "Open menu"}
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <MobileActionLink
                  href="/search"
                  label={t("common.search")}
                  icon={Search}
                />
                <MobileActionLink
                  href={isAuthenticated ? "/account/favorites" : "/auth/sign-in"}
                  label={t("account.favorites")}
                  icon={Heart}
                  badge={wishlistCount}
                />
                <MobileActionLink
                  href="/cart"
                  label={t("cart.title")}
                  icon={ShoppingBag}
                  badge={cartCount}
                />
              </div>
            </div>

            <div className="hidden h-[var(--header-height)] items-center gap-3 lg:flex lg:gap-5">
              <div className="flex shrink-0 items-center gap-4">
                <Logo locale={locale} />
              </div>

              <nav className="flex min-w-0 flex-1 items-center justify-center gap-4 xl:gap-5">
                {mainNavigation.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "whitespace-nowrap text-sm leading-none transition-colors",
                        active ? "text-text" : "text-text-soft hover:text-text"
                      )}
                    >
                      {t(item.labelKey)}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden shrink-0 items-center gap-2 lg:flex">
                <CountrySwitcher locale={locale} countryCode={countryCode} />
                <LanguageSwitcher locale={locale} countryCode={countryCode} />
              </div>

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <Button asChild variant="ghost" size="sm" className="h-11 w-11 rounded-full p-0">
                  <Link href="/search" aria-label={t("common.search")}>
                    <Search className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="relative h-11 w-11 rounded-full p-0"
                >
                  <Link href={isAuthenticated ? "/account/favorites" : "/auth/sign-in"}>
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 ? (
                      <span className="absolute -end-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blush px-1 text-[10px] text-white">
                        {wishlistCount}
                      </span>
                    ) : null}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="relative h-11 w-11 rounded-full p-0"
                >
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
                  <Link href={accountHref}>
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
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <div className="lg:hidden">
            <motion.button
              type="button"
              aria-label={locale === "ar" ? "إغلاق القائمة" : "Close menu"}
              className="fixed inset-0 z-50 bg-[rgba(16,12,9,0.46)] backdrop-blur-[4px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={overlayTransition}
              onClick={closeMobileMenu}
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              className={cn(
                "fixed z-[60] flex w-[min(92vw,25rem)] flex-col overflow-hidden bg-white shadow-[0_34px_80px_-30px_rgba(17,12,8,0.42)]",
                locale === "ar" ? "right-2" : "left-2"
              )}
              style={{
                top: "calc(env(safe-area-inset-top, 0px) + 0.55rem)",
                bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.65rem)",
                borderRadius: "1.75rem"
              }}
              initial={{
                x: drawerDirectionOffset,
                opacity: prefersReducedMotion ? 1 : 0.92,
                scale: prefersReducedMotion ? 1 : 0.985
              }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{
                x: drawerDirectionOffset,
                opacity: prefersReducedMotion ? 1 : 0.92,
                scale: prefersReducedMotion ? 1 : 0.99
              }}
              transition={drawerTransition}
              onClick={(event) => event.stopPropagation()}
              data-lenis-prevent
            >
              <motion.div
                className="flex items-center justify-between border-b border-black/8 px-5 pb-5 pt-6"
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                transition={{ ...itemTransition, delay: prefersReducedMotion ? 0 : 0.04 }}
              >
                <Logo locale={locale} />
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-text transition hover:border-black/15 hover:bg-[#faf9f6]"
                  onClick={closeMobileMenu}
                  aria-label={locale === "ar" ? "إغلاق القائمة" : "Close menu"}
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>

              <div className="flex-1 overflow-y-auto px-5 pb-5 pt-5">
                <motion.div
                  className="grid grid-cols-3 gap-2.5"
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                  transition={{ ...itemTransition, delay: prefersReducedMotion ? 0 : 0.08 }}
                >
                  <MobileQuickLink
                    href="/cart"
                    label={t("cart.title")}
                    icon={ShoppingBag}
                    badge={cartCount}
                    onClick={closeMobileMenu}
                  />
                  <MobileQuickLink
                    href={isAuthenticated ? "/account/favorites" : "/auth/sign-in"}
                    label={t("account.favorites")}
                    icon={Heart}
                    badge={wishlistCount}
                    onClick={closeMobileMenu}
                  />
                  <MobileQuickLink
                    href="/search"
                    label={t("common.search")}
                    icon={Search}
                    onClick={closeMobileMenu}
                  />
                </motion.div>

                <nav className="mt-8">
                  {mainNavigation.map((item, index) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <motion.div
                        key={item.href}
                        initial={{
                          opacity: 0,
                          x: prefersReducedMotion ? 0 : locale === "ar" ? 12 : -12
                        }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{
                          opacity: 0,
                          x: prefersReducedMotion ? 0 : locale === "ar" ? 12 : -12
                        }}
                        transition={{
                          ...itemTransition,
                          delay: prefersReducedMotion ? 0 : 0.1 + index * 0.03
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            "flex items-center justify-between border-b border-black/8 py-4 text-[1.22rem] leading-[1.25] text-[#1d140d]",
                            active ? "font-semibold" : "font-normal"
                          )}
                        >
                          <span className="font-display">{t(item.labelKey)}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <motion.div
                  className="mt-8 border-t border-black/8 pt-5"
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                  transition={{ ...itemTransition, delay: prefersReducedMotion ? 0 : 0.24 }}
                >
                  <Link
                    href={accountHref}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-[1.1rem] border border-black/10 bg-[#f8f7f4] px-4 py-3.5 text-sm text-text transition hover:border-black/15 hover:bg-white"
                  >
                    <User className="h-4 w-4" />
                    <span>{accountLabel}</span>
                  </Link>

                  <div className="mt-3 space-y-2">
                    <CountrySwitcher
                      locale={locale}
                      countryCode={countryCode}
                      variant="drawer"
                    />
                    <LanguageSwitcher
                      locale={locale}
                      countryCode={countryCode}
                      variant="drawer"
                    />
                  </div>

                  {isAuthenticated ? (
                    <button
                      type="button"
                      className="mt-4 text-sm text-text-soft transition hover:text-text"
                      onClick={() => {
                        closeMobileMenu();
                        signOut();
                      }}
                    >
                      {t("account.logout")}
                    </button>
                  ) : null}
                </motion.div>
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
