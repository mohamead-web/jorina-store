import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/ar/account", "/en/account", "/ar/checkout", "/en/checkout"]
    },
    sitemap: `${siteConfig.url}/sitemap.xml`
  };
}
