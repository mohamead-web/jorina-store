"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { footerNavigation, siteConfig } from "@/lib/constants/site";
import { Link } from "@/lib/i18n/navigation";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="mt-16 border-t border-border bg-white/80 pb-[calc(env(safe-area-inset-bottom,0px)+8.25rem)] pt-14 lg:mt-20 lg:pb-12">
      <div className="page-section">
        <div className="section-container grid gap-10 lg:grid-cols-[1.1fr_0.5fr_0.5fr]">
          <div className="space-y-5">
            <h3 className="font-display text-3xl text-text">{t("footer.newsletterTitle")}</h3>
            <p className="max-w-xl text-sm leading-7 text-text-soft">
              {t("footer.newsletterBody")}
            </p>
            <form className="flex flex-col gap-3 sm:flex-row">
              <Input type="email" placeholder="name@email.com" className="sm:max-w-sm" />
              <Button type="submit" variant="blush">
                {t("common.save")}
              </Button>
            </form>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-medium text-text">{siteConfig.name}</h4>
            <div className="space-y-3 text-sm text-text-soft">
              {footerNavigation.brand.map((item) => (
                <Link key={item.href} href={item.href} className="block hover:text-text">
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-medium text-text">
              {t("navigation.privacyPolicy")}
            </h4>
            <div className="space-y-3 text-sm text-text-soft">
              {footerNavigation.policy.map((item) => (
                <Link key={item.href} href={item.href} className="block hover:text-text">
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="section-container mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.copyright")}</p>
          <p>{siteConfig.contactEmail}</p>
        </div>
      </div>
    </footer>
  );
}
