"use client";

import { Heart, House, Search, ShoppingBag, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function MobileBottomNav({
  locale,
  cartCount,
  isAuthenticated
}: {
  locale: "ar" | "en";
  cartCount: number;
  isAuthenticated: boolean;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const hidden =
    pathname === "/cart" ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/products/");

  if (hidden) {
    return null;
  }

  const items = [
    { id: "home", href: "/", icon: House, label: t("navigation.home") },
    { id: "shop", href: "/shop", icon: Search, label: t("navigation.shop") },
    { id: "cart", href: "/cart", icon: ShoppingBag, badge: cartCount, label: t("cart.title") },
    {
      id: "favorites",
      href: isAuthenticated ? "/account/favorites" : "/auth/sign-in",
      icon: Heart,
      label: t("account.favorites")
    },
    {
      id: "account",
      href: isAuthenticated ? "/account" : "/auth/sign-in",
      icon: User,
      label: locale === "ar" ? "الحساب" : "Account"
    }
  ];

  return (
    <div
      className="fixed inset-x-0 z-40 px-5 lg:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.2rem)" }}
    >
      <nav className="mx-auto flex max-w-sm justify-between gap-1 rounded-[2rem] border border-white/60 bg-white/70 px-4 py-2.5 shadow-[0_16px_40px_-12px_rgba(17,17,17,0.16)] backdrop-blur-2xl">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "relative flex min-w-[3.5rem] flex-col items-center justify-center rounded-[1.2rem] px-1 py-1.5 text-[10px] sm:min-w-[4rem]",
                active ? "font-semibold text-text" : "text-text-muted hover:text-text-soft"
              )}
              aria-label={item.label}
            >
              <Icon className="h-4 w-4" />
              <span className="mt-1 max-w-full truncate">{item.label}</span>
              {item.badge ? (
                <span className="absolute -end-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-text px-1 text-[10px] text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
