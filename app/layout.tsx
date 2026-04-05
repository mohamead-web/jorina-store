import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { siteConfig } from "@/lib/constants/site";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "JORINA",
    template: "%s | JORINA"
  },
  description: siteConfig.description
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale()) === "en" ? "en" : "ar";

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
