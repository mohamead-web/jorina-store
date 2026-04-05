import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/constants/site";

const staticRoutes = [
  "",
  "/shop",
  "/categories",
  "/new-arrivals",
  "/best-sellers",
  "/offers",
  "/about",
  "/contact",
  "/faq",
  "/shipping-delivery",
  "/returns-policy",
  "/privacy-policy",
  "/terms"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["ar", "en"] as const;

  return locales.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${siteConfig.url}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "daily" : "weekly",
      priority: route === "" ? 1 : 0.7
    }))
  );
}
