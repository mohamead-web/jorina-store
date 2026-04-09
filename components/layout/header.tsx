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
import { useDeferredValue, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/layout/logo";
import { CountrySwitcher } from "@/components/navigation/country-switcher";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { HeaderSearchSurface } from "@/components/search/header-search-surface";
import { Button } from "@/components/ui/button";
import { mainNavigation } from "@/lib/constants/site";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { type AppCountry } from "@/types/domain";
import type { SmartSearchResultSet } from "@/types/search";

type HeaderProps = {
  locale: "ar" | "en";
  cartCount: number;
  wishlistCount: number;
  countryCode: AppCountry;
  isAuthenticated: boolean;
};

function createEmptySearchResults(): SmartSearchResultSet {
  return {
    query: "",
    normalizedQuery: "",
    products: [],
    categories: [],
    isFallback: false
  };
}

function MobileHeaderAction({
  href,
  label,
  icon: Icon,
  badge,
  onClick,
  ariaExpanded,
  ariaControls
}: {
  href?: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  onClick?: () => void;
  ariaExpanded?: boolean;
  ariaControls?: string;
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
    "relative inline-flex h-10 w-10 items-center justify-center text-[#8a6631] transition hover:opacity-70";

  if (href) {
    return (
      <Link href={href} aria-label={label} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-haspopup={ariaControls ? "dialog" : undefined}
      onClick={onClick}
      className={className}
    >
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

function MobileDrawerUtilityLink({
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
      className="relative flex flex-col items-center gap-2 px-2 py-1.5 text-center text-[0.8rem] leading-[1.35] text-[#4c433b] transition hover:text-[#1f1712]"
    >
      <Icon className="h-[1.05rem] w-[1.05rem] text-[#231a14]" strokeWidth={1.6} />
      <span>{label}</span>
      {badge ? (
        <span className="absolute left-1/2 top-0 inline-flex h-4 min-w-4 translate-x-2 items-center justify-center rounded-full bg-black px-1 text-[8px] font-medium leading-none text-white">
          {badge}
        </span>
      ) : null}
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
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SmartSearchResultSet>(
    createEmptySearchResults()
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobileHeaderVisible, setMobileHeaderVisible] = useState(true);
  const mobileOpen = mobileOpenPath === pathname;
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const effectiveMobileHeaderVisible =
    !isMobileViewport || mobileOpen || searchOpen || mobileHeaderVisible;

  const openMobileMenu = () => {
    setSearchOpen(false);
    setMobileHeaderVisible(true);
    setMobileOpenPath(pathname);
  };
  const closeMobileMenu = () => {
    setMobileHeaderVisible(true);
    setMobileOpenPath(null);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults(createEmptySearchResults());
    setSearchLoading(false);
  };
  const openSearch = () => {
    setMobileHeaderVisible(true);
    setMobileOpenPath(null);
    setSearchResults(createEmptySearchResults());
    setSearchQuery("");
    setSearchOpen(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const syncViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    syncViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewport);
      return () => mediaQuery.removeEventListener("change", syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  useEffect(() => {
    if (!mobileOpen && !searchOpen) {
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
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    if (!mobileOpen && !searchOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
        closeSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setSearchLoading(true);

      try {
        const params = new URLSearchParams({
          locale,
          q: deferredSearchQuery
        });
        const response = await fetch(`/api/search/suggest?${params.toString()}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Failed to load search suggestions");
        }

        const data = (await response.json()) as SmartSearchResultSet;

        if (!controller.signal.aborted) {
          setSearchResults(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSearchResults(createEmptySearchResults());
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, deferredSearchQuery.trim() ? 170 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [deferredSearchQuery, locale, searchOpen]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSearchOpen(false);
      setSearchLoading(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!isMobileViewport || mobileOpen) {
      return;
    }

    let frameId = 0;
    let lastScrollY = window.scrollY;
    const topThreshold = 12;
    const directionThreshold = 10;
    const hideAfter = 72;

    const updateVisibility = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY <= topThreshold) {
        setMobileHeaderVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      if (Math.abs(delta) < directionThreshold) {
        return;
      }

      if (delta > 0 && currentScrollY > hideAfter) {
        setMobileHeaderVisible(false);
      } else if (delta < 0) {
        setMobileHeaderVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    const handleScroll = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateVisibility();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobileViewport, mobileOpen]);

  const drawerHiddenX = locale === "ar" ? "100%" : "-100%";
  const premiumEase = [0.22, 1, 0.36, 1] as const;
  const responsiveHeaderEase = [0.18, 1, 0.32, 1] as const;
  const overlayTransition: Transition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.56, ease: premiumEase };
  const drawerTransition: Transition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.62, ease: premiumEase };
  const mobileHeaderTransition: Transition = prefersReducedMotion
    ? { duration: 0.01 }
    : effectiveMobileHeaderVisible
      ? { duration: 0.24, ease: responsiveHeaderEase }
      : { duration: 0.46, ease: responsiveHeaderEase };

  const accountHref = isAuthenticated ? "/account" : "/auth/sign-in";
  const accountLabel = isAuthenticated
    ? t("account.overview")
    : locale === "ar"
      ? "\u0627\u0644\u062d\u0633\u0627\u0628"
      : "Account";

  const utilityLinks =
    locale === "ar"
      ? [
          {
            href: "/cart",
            label: "\u0627\u0644\u0633\u0644\u0629",
            icon: ShoppingBag,
            badge: cartCount
          },
          {
            href: isAuthenticated ? "/account/favorites" : "/auth/sign-in",
            label: "\u0627\u0644\u0645\u0641\u0636\u0644\u0629",
            icon: Heart,
            badge: wishlistCount
          },
          {
            href: "/search",
            label: "\u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u0646\u062a\u062c \u0623\u0648 \u0641\u0626\u0629",
            icon: Search
          }
        ]
      : [
          {
            href: "/search",
            label: "Search products",
            icon: Search
          },
          {
            href: isAuthenticated ? "/account/favorites" : "/auth/sign-in",
            label: "Favorites",
            icon: Heart,
            badge: wishlistCount
          },
          {
            href: "/cart",
            label: "Cart",
            icon: ShoppingBag,
            badge: cartCount
          }
        ];

  const secondaryLinks =
    locale === "ar"
      ? [
          { href: accountHref, label: accountLabel },
          { href: "/contact", label: "\u0627\u062a\u0635\u0644 \u0628\u0646\u0627" },
          { href: "/about", label: "\u0627\u0643\u062a\u0634\u0641 \u0627\u0644\u0639\u0644\u0627\u0645\u0629" }
        ]
      : [
          { href: accountHref, label: accountLabel },
          { href: "/contact", label: "Contact us" },
          { href: "/about", label: "Discover the brand" }
        ];

  const mobileHeaderMotion = isMobileViewport
    ? {
        y: effectiveMobileHeaderVisible ? 0 : "-104%",
        opacity: effectiveMobileHeaderVisible ? 1 : 0
      }
    : {
        y: 0,
        opacity: 1
      };

  return (
    <>
      <motion.header
        initial={false}
        animate={mobileHeaderMotion}
        transition={mobileHeaderTransition}
        className={cn(
          "fixed inset-x-0 top-0 z-40 w-full border-b border-[#e9e3db] bg-white will-change-[transform,opacity] lg:sticky lg:border-white/60 lg:bg-white/80 lg:backdrop-blur-xl",
          effectiveMobileHeaderVisible ? "pointer-events-auto" : "pointer-events-none lg:pointer-events-auto"
        )}
      >
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
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[2rem] tracking-[0.045em] text-[#8a6631]"
                dir="ltr"
              >
                JORINA
              </Link>

              <div className="flex shrink-0 items-center">
                <MobileHeaderAction
                  label={t("common.search")}
                  icon={Search}
                  onClick={openSearch}
                  ariaExpanded={searchOpen}
                  ariaControls="header-search-surface"
                />
                <MobileHeaderAction
                  label={locale === "ar" ? "\u0641\u062a\u062d \u0627\u0644\u0642\u0627\u0626\u0645\u0629" : "Open menu"}
                  icon={Menu}
                  onClick={openMobileMenu}
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-drawer"
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-11 w-11 rounded-full p-0"
                  aria-label={t("common.search")}
                  aria-expanded={searchOpen}
                  aria-controls="header-search-surface"
                  onClick={openSearch}
                >
                    <Search className="h-5 w-5" />
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
      </motion.header>

      <HeaderSearchSurface
        open={searchOpen}
        locale={locale}
        isMobileViewport={isMobileViewport}
        query={searchQuery}
        results={searchResults}
        isLoading={searchLoading}
        onClose={closeSearch}
        onQueryChange={setSearchQuery}
        onSubmit={() => {
          const nextQuery = searchQuery.trim();
          closeSearch();
          router.push(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : "/search");
        }}
      />

      <AnimatePresence initial={false}>
        {mobileOpen ? (
          <div className="lg:hidden">
            <motion.button
              type="button"
              aria-label={locale === "ar" ? "\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0642\u0627\u0626\u0645\u0629" : "Close menu"}
              className="fixed inset-0 z-50 bg-[rgba(20,16,12,0.14)] backdrop-blur-[8px] will-change-[opacity]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={overlayTransition}
              onClick={closeMobileMenu}
            />

            <motion.aside
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              className={cn(
                "fixed inset-y-0 z-[60] flex w-[86vw] max-w-[22.5rem] flex-col overflow-hidden border-[rgba(26,20,15,0.06)] bg-white shadow-[0_18px_44px_-34px_rgba(16,12,8,0.18)] transform-gpu will-change-transform",
                locale === "ar" ? "right-0 border-s" : "left-0 border-e"
              )}
              initial={{ x: drawerHiddenX }}
              animate={{ x: 0 }}
              exit={{ x: drawerHiddenX }}
              transition={drawerTransition}
              onClick={(event) => event.stopPropagation()}
              data-lenis-prevent
            >
              <div className="flex h-full flex-col bg-white">
                <div
                  className={cn(
                    "shrink-0 px-6 pb-6 pt-[calc(env(safe-area-inset-top,0px)+1.1rem)]",
                    locale === "ar" ? "text-right" : "text-left"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-start justify-between gap-4",
                      locale === "ar" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Link
                      href="/"
                      onClick={closeMobileMenu}
                      className="inline-flex items-center gap-2.5 text-[#8a6631]"
                      dir="ltr"
                    >
                      <span className="font-display text-[1.46rem] tracking-[0.12em]">
                        JORINA
                      </span>
                      <Image
                        src="/brand/logo.png"
                        alt="JORINA"
                        width={58}
                        height={58}
                        className="h-[3.35rem] w-[3.35rem] object-contain"
                      />
                    </Link>

                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center text-[#241b14] transition hover:opacity-70"
                      onClick={closeMobileMenu}
                      aria-label={locale === "ar" ? "\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0642\u0627\u0626\u0645\u0629" : "Close menu"}
                    >
                      <X className="h-[1rem] w-[1rem]" strokeWidth={1.55} />
                    </button>
                  </div>
                </div>

                <div
                  className="flex-1 overflow-y-auto px-6 pb-4"
                  dir={locale === "ar" ? "rtl" : "ltr"}
                >
                  <div className="border-b border-[#ece5dc] pb-4">
                    <div className="grid grid-cols-3 gap-2">
                      {utilityLinks.map((item) => (
                        <MobileDrawerUtilityLink
                          key={item.href}
                          href={item.href}
                          label={item.label}
                          icon={item.icon}
                          badge={item.badge}
                          onClick={closeMobileMenu}
                        />
                      ))}
                    </div>
                  </div>

                  <nav>
                    {mainNavigation.map((item) => (
                      <MobileDrawerPrimaryLink
                        key={item.href}
                        href={item.href}
                        label={t(item.labelKey)}
                        locale={locale}
                        onClick={closeMobileMenu}
                      />
                    ))}
                  </nav>

                  <div className="mt-5 border-t border-[#ece5dc] pt-3">
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
                  </div>
                </div>

                <div className="shrink-0 border-t border-[#ece5dc] px-5 pb-[calc(env(safe-area-inset-bottom,0px)+0.55rem)] pt-3">
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
                </div>
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
