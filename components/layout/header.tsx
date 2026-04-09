"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  type LucideIcon,
  User,
  X
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
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

function MobileHeaderAction({
  href,
  label,
  icon: Icon,
  badge,
  onClick
}: {
  href?: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  onClick?: () => void;
}) {
  const content = (
    <>
      <Icon className="h-[1.3rem] w-[1.3rem]" strokeWidth={1.65} />
      {badge ? (
        <span className="absolute left-[1.45rem] top-1 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-black px-1 text-[9px] font-medium leading-none text-white">
          {badge}
        </span>
      ) : null}
    </>
  );

  const className =
    "relative inline-flex h-10 w-10 items-center justify-center text-[#141414] transition hover:opacity-70";

  if (href) {
    return (
      <Link href={href} aria-label={label} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function MobileDrawerPrimaryLink({
  href,
  label,
  locale,
  onClick
}: {
  href: string;
  label: string;
  locale: "ar" | "en";
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={cn(
        "flex items-center justify-between gap-4 border-b border-[#ece5dc] py-[0.92rem] text-[#241b14] transition hover:text-black",
        locale === "ar"
          ? "text-right text-[1.02rem] font-normal leading-[1.55] font-ui"
          : "text-[1.08rem] leading-[1.4] font-display"
      )}
    >
      {locale === "ar" ? (
        <>
          <span className="block flex-1">{label}</span>
          <ChevronLeft className="h-[0.82rem] w-[0.82rem] shrink-0 text-[#8c8076]" strokeWidth={1.45} />
        </>
      ) : (
        <>
          <span className="block flex-1">{label}</span>
          <ChevronRight className="h-[0.82rem] w-[0.82rem] shrink-0 text-[#8c8076]" strokeWidth={1.45} />
        </>
      )}
    </Link>
  );
}

function MobileDrawerSecondaryLink({
  href,
  label,
  locale,
  onClick
}: {
  href: string;
  label: string;
  locale: "ar" | "en";
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={cn(
        "block border-b border-[#ece5dc] py-[0.92rem] text-[#64584d] transition hover:text-[#241b14]",
        locale === "ar"
          ? "text-right text-[0.96rem] leading-[1.55] font-ui"
          : "text-[0.95rem] leading-[1.45]"
      )}
    >
      {label}
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

  const drawerDirectionOffset = locale === "ar" ? 28 : -28;
  const premiumEase = [0.22, 1, 0.36, 1] as const;
  const overlayTransition: Transition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.26, ease: premiumEase };
  const drawerTransition: Transition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.38, ease: premiumEase };
  const itemTransition: Transition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.3, ease: premiumEase };

  const accountHref = isAuthenticated ? "/account" : "/auth/sign-in";
  const accountLabel = isAuthenticated
    ? t("account.overview")
    : locale === "ar"
      ? "\u0627\u0644\u062d\u0633\u0627\u0628"
      : "Account";

  const secondaryLinks =
    locale === "ar"
      ? [
          { href: accountHref, label: accountLabel },
          {
            href: isAuthenticated ? "/account/favorites" : "/auth/sign-in",
            label: "\u0627\u0644\u0645\u0641\u0636\u0644\u0629"
          },
          { href: "/cart", label: "\u0627\u0644\u0633\u0644\u0629" },
          { href: "/search", label: "\u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u0646\u062a\u062c" },
          { href: "/contact", label: "\u0627\u062a\u0635\u0644 \u0628\u0646\u0627" },
          { href: "/about", label: "\u0627\u0643\u062a\u0634\u0641 \u0627\u0644\u0639\u0644\u0627\u0645\u0629" }
        ]
      : [
          { href: accountHref, label: accountLabel },
          {
            href: isAuthenticated ? "/account/favorites" : "/auth/sign-in",
            label: "Favorites"
          },
          { href: "/cart", label: "Cart" },
          { href: "/search", label: "Search" },
          { href: "/contact", label: "Contact us" },
          { href: "/about", label: "Discover the brand" }
        ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#e9e3db] bg-white lg:border-white/60 lg:bg-white/80 lg:backdrop-blur-xl">
        <div className="page-section">
          <div className="section-container">
            <div className="relative flex h-[4.9rem] items-center justify-between lg:hidden" dir="ltr">
              <div className="flex shrink-0 items-center">
                <MobileHeaderAction
                  href="/cart"
                  label={locale === "ar" ? "\u0627\u0644\u0633\u0644\u0629" : "Cart"}
                  icon={ShoppingBag}
                  badge={cartCount}
                />
                <MobileHeaderAction
                  href={accountHref}
                  label={accountLabel}
                  icon={User}
                />
              </div>

              <Link
                href="/"
                aria-label={locale === "ar" ? "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629" : "Back to home"}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[2rem] tracking-[0.045em] text-[#2c241e]"
                dir="ltr"
              >
                JORINA
              </Link>

              <div className="flex shrink-0 items-center">
                <MobileHeaderAction
                  href="/search"
                  label={t("common.search")}
                  icon={Search}
                />
                <MobileHeaderAction
                  label={locale === "ar" ? "\u0641\u062a\u062d \u0627\u0644\u0642\u0627\u0626\u0645\u0629" : "Open menu"}
                  icon={Menu}
                  onClick={openMobileMenu}
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
                        ? "\u062f\u062e\u0648\u0644"
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
              aria-label={locale === "ar" ? "\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0642\u0627\u0626\u0645\u0629" : "Close menu"}
              className="fixed inset-0 z-50 bg-[rgba(20,16,12,0.12)] backdrop-blur-[10px]"
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
                "fixed z-[60] flex w-[calc(100vw-0.7rem)] max-w-[22.85rem] flex-col overflow-hidden border border-[#e8e1d9] bg-white shadow-[0_26px_70px_-40px_rgba(16,12,8,0.34)]",
                locale === "ar" ? "right-2" : "left-2"
              )}
              style={{
                top: "calc(env(safe-area-inset-top, 0px) + 0.45rem)",
                bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.55rem)",
                borderRadius: "0.4rem"
              }}
              initial={{
                x: drawerDirectionOffset,
                opacity: prefersReducedMotion ? 1 : 0.98
              }}
              animate={{ x: 0, opacity: 1 }}
              exit={{
                x: drawerDirectionOffset,
                opacity: prefersReducedMotion ? 1 : 0.98
              }}
              transition={drawerTransition}
              onClick={(event) => event.stopPropagation()}
              data-lenis-prevent
            >
              <motion.div
                className="shrink-0 border-b border-[#ece5dc] px-5 pb-3.5 pt-[1.125rem]"
                dir="ltr"
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                transition={{ ...itemTransition, delay: prefersReducedMotion ? 0 : 0.03 }}
              >
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center text-[#241b14] transition hover:opacity-70"
                    onClick={closeMobileMenu}
                    aria-label={locale === "ar" ? "\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0642\u0627\u0626\u0645\u0629" : "Close menu"}
                  >
                    <X className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.6} />
                  </button>

                  <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-1.5 text-[#2c241e]"
                    dir="ltr"
                  >
                    <span className="font-display text-[1.5rem] tracking-[0.14em]">
                      JORINA
                    </span>
                    <Image
                      src="/brand/logo.png"
                      alt="JORINA"
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                  </Link>
                </div>
              </motion.div>

              <div
                className="flex-1 overflow-y-auto px-5 pb-3 pt-[1.125rem]"
                dir={locale === "ar" ? "rtl" : "ltr"}
              >
                <nav>
                  {mainNavigation.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{
                        opacity: 0,
                        x: prefersReducedMotion ? 0 : locale === "ar" ? 10 : -10
                      }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: prefersReducedMotion ? 0 : locale === "ar" ? 10 : -10
                      }}
                      transition={{
                        ...itemTransition,
                        delay: prefersReducedMotion ? 0 : 0.06 + index * 0.022
                      }}
                    >
                      <MobileDrawerPrimaryLink
                        href={item.href}
                        label={t(item.labelKey)}
                        locale={locale}
                        onClick={closeMobileMenu}
                      />
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  className="mt-3"
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                  transition={{ ...itemTransition, delay: prefersReducedMotion ? 0 : 0.16 }}
                >
                  {secondaryLinks.map((item) => (
                    <MobileDrawerSecondaryLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      locale={locale}
                      onClick={closeMobileMenu}
                    />
                  ))}
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        signOut();
                      }}
                      className={cn(
                        "block w-full border-b border-[#ece5dc] py-[0.92rem] text-[#64584d] transition hover:text-[#241b14]",
                        locale === "ar"
                          ? "text-right text-[0.96rem] leading-[1.55] font-ui"
                          : "text-start text-[0.95rem] leading-[1.45]"
                      )}
                    >
                      {t("account.logout")}
                    </button>
                  ) : null}
                </motion.div>
              </div>

              <motion.div
                className="shrink-0 border-t border-[#ece5dc] px-5 pb-4 pt-3.5"
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                transition={{ ...itemTransition, delay: prefersReducedMotion ? 0 : 0.2 }}
              >
                <div className="grid grid-cols-2 gap-1.5 rounded-[0.35rem] bg-[#777777] p-1.5">
                  <CountrySwitcher
                    locale={locale}
                    countryCode={countryCode}
                    variant="mobileDrawer"
                  />
                  <LanguageSwitcher
                    locale={locale}
                    countryCode={countryCode}
                    variant="mobileDrawer"
                  />
                </div>
              </motion.div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
