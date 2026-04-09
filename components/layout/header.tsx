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
      <Icon className="h-[1.55rem] w-[1.55rem]" strokeWidth={1.8} />
      {badge ? (
        <span className="absolute left-6 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
          {badge}
        </span>
      ) : null}
    </>
  );

  const className =
    "relative inline-flex h-11 w-11 items-center justify-center text-[#141414] transition hover:opacity-70";

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

function MobileDrawerShortcut({
  href,
  label,
  icon: Icon,
  badge,
  onClick
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative flex flex-1 flex-col items-center justify-center rounded-[1.2rem] border border-[#e4ddd4] bg-[#fbfaf7] px-3 py-4 text-center text-[0.95rem] leading-tight text-[#211913] shadow-[0_14px_30px_-28px_rgba(17,12,8,0.25)] transition hover:bg-white"
    >
      <Icon className="h-5 w-5" strokeWidth={1.8} />
      <span className="mt-2">{label}</span>
      {badge ? (
        <span className="absolute right-3 top-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
          {badge}
        </span>
      ) : null}
    </Link>
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
      className="flex items-center justify-between gap-4 border-b border-[#ece5dc] py-4 text-[1.2rem] leading-[1.35] text-[#241b14] transition hover:text-black"
    >
      {locale === "ar" ? (
        <>
          <ChevronLeft className="h-4 w-4 shrink-0 text-[#86786c]" strokeWidth={1.5} />
          <span className="font-display">{label}</span>
        </>
      ) : (
        <>
          <span className="font-display">{label}</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#86786c]" strokeWidth={1.5} />
        </>
      )}
    </Link>
  );
}

function MobileDrawerSecondaryLink({
  href,
  label,
  onClick
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block border-b border-[#ece5dc] py-4 text-[1rem] text-[#5d5248] transition hover:text-[#241b14]"
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

  const drawerDirectionOffset = locale === "ar" ? 36 : -36;
  const premiumEase = [0.22, 1, 0.36, 1] as const;
  const overlayTransition: Transition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.24, ease: premiumEase };
  const drawerTransition: Transition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.34, ease: premiumEase };
  const itemTransition: Transition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.26, ease: premiumEase };

  const accountHref = isAuthenticated ? "/account" : "/auth/sign-in";
  const accountLabel = isAuthenticated
    ? t("account.overview")
    : locale === "ar"
      ? "الحساب"
      : "Account";

  const quickLinks =
    locale === "ar"
      ? [
          {
            href: "/cart",
            icon: ShoppingBag,
            label: "السلة",
            badge: cartCount
          },
          {
            href: isAuthenticated ? "/account/favorites" : "/auth/sign-in",
            icon: Heart,
            label: "المفضلة",
            badge: wishlistCount
          },
          {
            href: "/search",
            icon: Search,
            label: "ابحث عن منتج أو فئة"
          }
        ]
      : [
          {
            href: "/search",
            icon: Search,
            label: "Search products"
          },
          {
            href: isAuthenticated ? "/account/favorites" : "/auth/sign-in",
            icon: Heart,
            label: "Favorites",
            badge: wishlistCount
          },
          {
            href: "/cart",
            icon: ShoppingBag,
            label: "Cart",
            badge: cartCount
          }
        ];

  const secondaryLinks =
    locale === "ar"
      ? [
          { href: accountHref, label: accountLabel },
          { href: "/contact", label: "اتصل بنا" },
          { href: "/about", label: "اكتشف العلامة" }
        ]
      : [
          { href: accountHref, label: accountLabel },
          { href: "/contact", label: "Contact us" },
          { href: "/about", label: "Discover the brand" }
        ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#e9e3db] bg-white lg:border-white/60 lg:bg-white/80 lg:backdrop-blur-xl">
        <div className="page-section">
          <div className="section-container">
            <div className="relative flex h-[5.35rem] items-center justify-between lg:hidden" dir="ltr">
              <div className="flex shrink-0 items-center">
                <MobileHeaderAction
                  href="/cart"
                  label={locale === "ar" ? "السلة" : "Cart"}
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
                aria-label={locale === "ar" ? "العودة إلى الرئيسية" : "Back to home"}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[2.2rem] tracking-[0.03em] text-[#2c241e]"
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
                  label={locale === "ar" ? "فتح القائمة" : "Open menu"}
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
                    {isAuthenticated ? t("account.overview") : locale === "ar" ? "دخول" : "Sign in"}
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
              className="fixed inset-0 z-50 bg-[rgba(24,18,13,0.28)] backdrop-blur-[2px]"
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
                "fixed z-[60] flex w-[calc(100vw-1rem)] max-w-[23rem] flex-col overflow-hidden border border-[#e8e1d9] bg-white shadow-[0_28px_70px_-38px_rgba(16,12,8,0.42)]",
                locale === "ar" ? "right-2" : "left-2"
              )}
              style={{
                top: "calc(env(safe-area-inset-top, 0px) + 0.55rem)",
                bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
                borderRadius: "1rem"
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
                className="shrink-0 border-b border-[#ece5dc] px-5 pb-4 pt-5"
                dir="ltr"
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                transition={{ ...itemTransition, delay: prefersReducedMotion ? 0 : 0.03 }}
              >
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e2dbd3] text-[#241b14] transition hover:bg-[#faf8f4]"
                    onClick={closeMobileMenu}
                    aria-label={locale === "ar" ? "إغلاق القائمة" : "Close menu"}
                  >
                    <X className="h-5 w-5" strokeWidth={1.7} />
                  </button>

                  <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 text-[#2c241e]"
                    dir="ltr"
                  >
                    <span className="font-display text-[1.65rem] tracking-[0.18em]">
                      JORINA
                    </span>
                    <Image
                      src="/brand/logo.png"
                      alt="JORINA"
                      width={26}
                      height={26}
                      className="h-6 w-6 object-contain"
                    />
                  </Link>
                </div>
              </motion.div>

              <div className="flex-1 overflow-y-auto px-5 pb-3 pt-5" dir={locale === "ar" ? "rtl" : "ltr"}>
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                  transition={{ ...itemTransition, delay: prefersReducedMotion ? 0 : 0.06 }}
                >
                  {quickLinks.map((item) => (
                    <MobileDrawerShortcut
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      badge={item.badge}
                      onClick={closeMobileMenu}
                    />
                  ))}
                </motion.div>

                <nav className="mt-7">
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
                        delay: prefersReducedMotion ? 0 : 0.08 + index * 0.025
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
                  className="mt-6"
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                  transition={{ ...itemTransition, delay: prefersReducedMotion ? 0 : 0.18 }}
                >
                  {secondaryLinks.map((item) => (
                    <MobileDrawerSecondaryLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
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
                      className="block w-full border-b border-[#ece5dc] py-4 text-start text-[1rem] text-[#5d5248] transition hover:text-[#241b14]"
                    >
                      {t("account.logout")}
                    </button>
                  ) : null}
                </motion.div>
              </div>

              <motion.div
                className="shrink-0 border-t border-[#ece5dc] px-5 pb-5 pt-4"
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                transition={{ ...itemTransition, delay: prefersReducedMotion ? 0 : 0.22 }}
              >
                <div className="grid grid-cols-2 gap-2 rounded-[0.75rem] bg-[#767676] p-1.5">
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
