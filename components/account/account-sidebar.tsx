"use client";

import { useTranslations } from "next-intl";

import { accountNavigation } from "@/lib/constants/site";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function AccountSidebar() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <>
      <aside className="premium-card sticky top-[calc(var(--header-height)+1rem)] hidden self-start p-3 lg:block">
        <nav className="grid gap-2">
          {accountNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-[1.2rem] px-4 py-3 text-sm transition",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-text text-white"
                  : "text-text-soft hover:bg-background-soft hover:text-text"
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
      </aside>

      <aside className="lg:hidden">
        <nav
          className="premium-card flex gap-2 overflow-x-auto p-2"
          data-lenis-prevent
        >
          {accountNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-4 py-3 text-sm transition",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-text text-white"
                  : "bg-background-soft text-text-soft"
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
